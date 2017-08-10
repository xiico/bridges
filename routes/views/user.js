var keystone = require('keystone');

exports = module.exports = function (req, res) {

	var view = new keystone.View(req, res);
	var locals = res.locals;

	// Set locals
	locals.section = 'user';

	// Load the galleries by sortOrder
	view.query('profile', keystone.list('User').model.findOne({_id:req.params.id}));

	// Render the view
	view.render('user');

};