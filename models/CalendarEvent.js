// // load the things we need
// var mongoose = require('mongoose');

// // define the schema for our user model
// var calendarEvent = mongoose.Schema({
//     id: Number,
//     title: String,
//     start: Date,
//     end: Date,
//     url: String,
// });

// // create the model for users and expose it to our app
// module.exports = mongoose.model('calendarEvent', calendarEvent);
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * CalendarEvent Model
 * ==========
 */
var CalendarEvent = new keystone.List('CalendarEvent', {
	map: { name: 'title' },
});

CalendarEvent.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'requested, accepted, active, suspended, archived', default: 'requested', index: true },
	owner: { type: Types.Relationship, ref: 'User', index: true },
	participants: { type: Types.Relationship, ref: 'User', many: true },
    start: { type: Types.Datetime, index: true },
	end: { type: Types.Datetime},
	allDay:{ type: Boolean, index: true },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 },
	},
	categories: { type: Types.Relationship, ref: 'EventCategory' }
});

// Post.relationship({ path: 'comments', ref: 'PostComment', refPath: 'post' });

// Post.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
CalendarEvent.register();