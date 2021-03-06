var keystone = require('keystone');
var async = require('async');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Init locals
	locals.section = 'blog';
	locals.filters = {
		category: req.params.category,
	};
	locals.data = {
		posts: [],
		categories: [],
	};

	// Load all categories
	view.on('init', function (next) {

		keystone.list('PostCategory').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function (category, next) {

				keystone.list('Post').model.count().where('categories').in([category.id]).exec(function (err, count) {
					category.postCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current category filter
	view.on('init', function (next) {

		if (req.params.category) {
			keystone.list('PostCategory').model.findOne({ key: locals.filters.category }).exec(function (err, result) {
				locals.data.category = result;
				next(err);
			});
		} else {
			next();
		}
	});

	// Load the posts
	view.on('init', function (next) {

		var q = keystone.list('Post').paginate({
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author categories');

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});
	});

	// count post comments
	view.on('init', function (next) {
		// Load the counts for each post
		async.each(locals.data.posts.results, function (post, next) {
			keystone.list('PostComment').model.count().where('post').in([post.id]).exec(function (err, count) {
				post.comments = count;
				post.isLoved = !!(post.loved.toString().split(',').find(item => locals.user != null && item == locals.user.id));
				next(err);
			});

		}, function (err) {
			next(err);
		});
	});

	// load latest comments
	view.on('init', function (next) {
		keystone.list('PostComment').model.find()
			.where('commentState', 'published')
			.limit(3)
			.populate('post', 'slug')
			.populate('author', 'name photo')
			.sort({ publishedOn: -1 })
			.exec(function (err, comments) {
				if (err) return res.err(err);
				if (!comments) return;// res.notfound('No recents comments');
				locals.data.comments = comments;
				next();
			});
	});

	// Render the view
	view.render('blog');
	// view.render('blog_old');
};
