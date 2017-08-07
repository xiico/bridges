/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
var _ = require('lodash');


/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	// res.locals.navLinks = [
	// 	{ label: 'Home', key: 'home', href: '/' },
	// 	{ label: 'Blog', key: 'blog', href: '/blog' },
	// 	{ label: 'Gallery', key: 'gallery', href: '/gallery' },
	// 	{ label: 'Contact', key: 'contact', href: '/contact' },
	// 	{ label: 'About Us', key: 'aboutus', href: '/aboutus' },
	// ];

	res.locals.navLinks = [
		{ section: "Home", links: [], key: "home", href: "/" },
		{
			section: "Pages", links: [
				{ label: 'About', key: 'aboutus', href: '/aboutus' },
				{ label: 'About 2', key: 'aboutus', href: '/aboutus2' },
				{ label: 'Services', key: 'service', href: '/service' },
				{ label: 'Pricing', key: 'pricing', href: '/pricing' },
				{ label: 'Contact us', key: 'contact', href: '/contact' },
				{ label: 'Contact us 2', key: 'contact2', href: '/contact2' },
				{ label: '404 error', key: '404error', href: '404.html' },
				{ label: 'Coming Soon', key: 'comingsoon', href: 'coming-soon.html' },],
			key: "pages"
		},
		{
			section: "Pages", links: [
				{ label: 'About', key: 'aboutus', href: '/aboutus' },
				{ label: 'About 2', key: 'aboutus', href: '/aboutus2' },
				{ label: 'Services', key: 'service', href: '/service' },
				{ label: 'Pricing', key: 'pricing', href: '/pricing' },
				{ label: 'Contact us', key: 'contact', href: '/contact' },
				{ label: 'Contact us 2', key: 'contact2', href: '/contact2' },
				{ label: '404 error', key: '404error', href: '404.html' },
				{ label: 'Coming Soon', key: 'comingsoon', href: 'coming-soon.html' },],
			key: "pages"
		},
		{
			section: "Pages", links: [
				{ label: 'About', key: 'aboutus', href: '/aboutus' },
				{ label: 'About 2', key: 'aboutus', href: '/aboutus2' },
				{ label: 'Services', key: 'service', href: '/service' },
				{ label: 'Pricing', key: 'pricing', href: '/pricing' },
				{ label: 'Contact us', key: 'contact', href: '/contact' },
				{ label: 'Contact us 2', key: 'contact2', href: '/contact2' },
				{ label: '404 error', key: '404error', href: '404.html' },
				{ label: 'Coming Soon', key: 'comingsoon', href: 'coming-soon.html' },],
			key: "pages"
		},
	];

	res.locals.user = req.user;
	res.locals.url = req.url;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	var flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};
