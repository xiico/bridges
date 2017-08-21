var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;


	// Load the current post
	view.on('init', function (next) {
		// locals.section is used to set the currently selected
		// item in the header navigation.
		locals.section = 'calendar';
		locals.userid = req.user ? req.user.id : null;
		locals.qid = req.params.userid;

		if (!locals.userid || !locals.qid || (locals.userid != locals.qid && !locals.user.isAdmin)) return view.render('errors/404');

		//view.query('profile', keystone.list('User').model.findOne({ _id: "5988aef4b877951a0822b50e" }).populate('timezone'));//"5988aef4b877951a0822b50e",locals.qid
		// if(locals.user.timezone)
		// 	view.query('timezone', keystone.list('TimeZone').model.findOne({_id:"598dcbc0533daca5f7ee5e4d"}));//"598dcbc0533daca5f7ee5e4d",locals.user.timezone.toString()

		if (!locals.user) return res.status(404).render('errors/404');
		// var q = keystone.list('Post').model.findOne({
		// 	state: 'published',
		// 	slug: locals.filters.post,
		// }).populate('author categories');

		// q.exec(function (err, result) {
		// 	locals.data.post = result;
		// 	next(err);
		// });
		keystone.list('User').model.findOne({ _id: "5988aef4b877951a0822b50e" }).populate('timezone').
			exec(function (err, profile) {
				locals.profile = profile;
				next(err);
				//console.log('The creator is %s', story._creator.name);
				// prints "The creator is Aaron"
			});
	});

	// Load the current post
	view.on('init', function (next) {
		keystone.list('TimeZone').model.findOne({ _id: "598dcbc0533daca5f7ee5e4d" }).
			exec(function (err, timezone) {
				locals.timezone = timezone;
				next(err);
				//console.log('The creator is %s', story._creator.name);
				// prints "The creator is Aaron"
			});
	});

	// Render the view
	view.render('calendar');
};