var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// locals.section is used to set the currently selected
	// item in the header navigation.
	locals.section = 'calendar';
	locals.userid = req.user ? req.user.id : null;
	locals.qid = req.params.userid;

	if(!locals.userid || !locals.qid || (locals.userid != locals.qid && !locals.user.isAdmin)) return view.render('errors/404');	

	view.query('profile', keystone.list('User').model.findOne({_id:locals.qid}).populate('timezone'));

	if(!locals.user) return res.status(404).render('errors/404');	

	// Render the view
	view.render('calendar');
};