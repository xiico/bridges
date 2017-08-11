var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'user';	

	if(!locals.user) return view.render('errors/404');	

	// Load the galleries by sortOrder
	// view.query('profile', keystone.list('User').model.findOne({_id:req.params.id}).populate('timezone').exec(function(err,user){
	// 	if(err) return res.err(err);
	// 	if(user.isStudent && res.locals.user.isTeacher) return res.status(404).render('errors/404');
	// }));

	// Load the current post
	view.on('init', function (next) {

		var q = keystone.list('User').model.findOne({_id:req.params.id}).populate('timezone');

		q.exec(function (err, result) {
			locals.profile = result;
			if((result.isStudent && res.locals.user.isStudent) || (result.isTeacher && res.locals.user.isTeacher)) return res.render('errors/404');;
			next();
		});
	});

	// Render the view
	view.render('user');

};