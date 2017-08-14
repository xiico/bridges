var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'teachers';
	locals.userid = res.locals.user ? res.locals.user.id : null;

	// Load the galleries by sortOrder
	view.query('teachers', keystone.list('User').model.find({isTeacher:true}).sort('sortOrder'));

	// Render the view
	view.render('teachers');

};