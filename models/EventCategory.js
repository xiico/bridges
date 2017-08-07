var keystone = require('keystone');

/**
 * PostCategory Model
 * ==================
 */

var EventCategory = new keystone.List('EventCategory', {
	autokey: { from: 'name', path: 'key', unique: true },
});

EventCategory.add({
	name: { type: String, required: true },
});

EventCategory.relationship({ ref: 'CalendarEvent', path: 'events', refPath: 'categories' });

EventCategory.register();
