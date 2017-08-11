var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'students';

	// Load the galleries by sortOrder
	view.query('students', keystone.list('User').model.find({isStudent:true}).sort('sortOrder'));

	// Render the view
	view.render('students');

};