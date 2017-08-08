var keystone = require('keystone');
var async = require('async');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'blogtimeline';

	// Init locals	
	locals.data = {
		posts: [],
		categories: [],
	};
	locals.filters = {
		page: req.params.page,
	};

	// Load the posts
	view.on('get', function (next) {

		if (!req.params.page) return next();

		var q = keystone.list('Post').paginate({
			page: req.params.page,
			perPage: 5,
			maxPages: 1,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author categories');

		q.exec(function (err, results) {
			// locals.data.posts = results;
			locals.data.posts = results;
			locals.data.postGroups = [];
			var lastGroup = '';
			var curGroup = '';
			async.each(locals.data.posts.results, function (post, next) {
				curGroup = post._.publishedDate.format('MMMM YYYY');
				if (lastGroup !== curGroup) {
					locals.data.postGroups.push({ group: curGroup, posts: [post] });
				} else locals.data.postGroups[locals.data.postGroups.length - 1].posts.push(post);
				lastGroup = curGroup;
				keystone.list('PostComment').model.count().where('post').in([post.id]).exec(function (err, count) {
					post.comments = count;
					next(err);
				});
			}, function (err) {
				res.render('postspage');
			});
		});
	});

	// Load the posts
	view.on('init', function (next) {

		var q = keystone.list('Post').paginate({
			page: 1,
			perPage: 15, // 5
			maxPages: 1,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author categories');

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});
	});

	// count post comments and group by month
	view.on('init', function (next) {
		locals.data.postGroups = [];
		var lastGroup = '';
		var curGroup = '';
		// Load the counts for each post
		async.each(locals.data.posts.results, function (post, next) {
			curGroup = post._.publishedDate.format('MMMM YYYY');
			if (lastGroup !== curGroup) {
				locals.data.postGroups.push({ name: curGroup, posts: [post] });
			} else locals.data.postGroups[locals.data.postGroups.length - 1].posts.push(post);
			lastGroup = curGroup;
			keystone.list('PostComment').model.count().where('post').in([post.id]).exec(function (err, count) {
				post.comments = count;
				next(err);
			});

		}, function (err) {
			next(err);
		});
	});

	// Render the view
	view.render('blogtimeline');
};
