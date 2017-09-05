/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

var keystone = require('keystone');
var middleware = require('./middleware');
var importRoutes = keystone.importer(__dirname);

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);


keystone.set('404', function (req, res, next) {
    //middleware.theme(req, res, next);
	res.status(404).render('errors/404');
});

keystone.set('500', function (req, res, next) {
    //middleware.theme(req, res, next);
	res.status(500).render('errors/500');
});

// Import Route Controllers
var routes = {
	views: importRoutes('./views'),
	api: importRoutes('./api'),
};

// Setup Route Bindings
exports = module.exports = function (app) {
	// Views
	app.get('/', routes.views.index);
	app.all('/blog/:category?', routes.views.blog);
	app.all('/blog/post/:post', routes.views.post);
	app.get('/gallery', routes.views.gallery);
	app.all('/contact', routes.views.contact);
	app.all('/aboutus', routes.views.aboutus);
	app.all('/aboutus2', routes.views.aboutus2);
	app.all('/service', routes.views.service);
	app.all('/pricing', routes.views.pricing);
	app.all('/contact2', routes.views.contact2);
	app.all('/blogone', routes.views.blogone);
	app.all('/blogtimeline', routes.views.blogtimeline);
	app.all('/blogthree', routes.views.blogthree);
	//app.all('/blogmasonry', routes.views.blogmasonry);
	app.all('/blogmasonry/:page?', routes.views.blogmasonry);
	app.all('/blogdetails', routes.views.blogdetails);
	app.all('/portfolio', routes.views.portfolio);
	app.all('/portfolioone', routes.views.portfolioone);
	app.all('/portfoliotwo', routes.views.portfoliotwo);
	app.all('/portfoliothree', routes.views.portfoliothree);
	app.all('/portfoliofour', routes.views.portfoliofour);
	app.all('/portfoliodetails', routes.views.portfoliodetails);
	app.all('/shortcodes', routes.views.shortcodes);
	app.all('/calendar/:userid', middleware.requireUser, routes.views.calendar);
	app.all('/teachers', routes.views.teachers);
	app.all('/students', routes.views.students);
	app.all('/user/:id', routes.views.user);
	app.all('/user/:id/edit', middleware.requireUser, routes.views.edituser);

	// Calendar API
	app.all('/calendardata', keystone.middleware.api, routes.api.calendar.list);
	app.all('/calendarevent/create', keystone.middleware.api, routes.api.calendar.create);
	app.all('/calendarevent/update', keystone.middleware.api, routes.api.calendar.update);

	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);

};
