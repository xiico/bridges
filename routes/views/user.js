var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'user';	

	if(!locals.user || !req.params.id) return view.render('errors/404');	
	locals.qid = req.params.id;

	// Load the galleries by sortOrder
	view.query('profile', keystone.list('User').model.findOne({_id:req.params.id}).populate({path: 'dow', options: { sort: { 'key': 1 } } }).populate('timezone'));

	// Load the current post
	// view.on('init', function (next) {

	// 	var q = keystone.list('User').model.findOne({_id:req.params.id}).populate('timezone');

	// 	q.exec(function (err, result) {
	// 		locals.profile = result;
	// 		if((result.isStudent && res.locals.user.isStudent) || (result.isTeacher && res.locals.user.isTeacher)) return res.render('errors/404');;
	// 		next();
	// 	});
	// });

	// Render the view
	view.render('user');

};