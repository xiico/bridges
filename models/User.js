var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	photo: { type: Types.CloudinaryImage, collapse: true },
	password: { type: Types.Password, initial: true, required: true },
	info: { type: Types.Html, wysiwyg: true, height: 400 },
	moto: { type: String, height: 400 },
	site: { type: Types.Url, initial: true},
	timezone: { type: Types.Relationship, ref: 'TimeZone', index: true },
	registered: { type: Types.Date, required: true, initial: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	canPost: { type: Boolean, label: 'Can write posts', index: true },
	isTeacher: { type: Boolean, label: 'Teacher', index: true },
	isStudent: { type: Boolean, label: 'Student', index: true }
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});


/**
 * Relationships
 */
User.relationship({ ref: 'Post', path: 'posts', refPath: 'author' });
User.relationship({ ref: 'CalendarEvent', path: 'calendarevents', refPath: 'owner' });

User.schema.methods.wasActive = function () {
	this.lastActiveOn = new Date();
	return this;
}

/**
 * Registration
 */
User.defaultColumns = 'name, isAdmin, Teacher, Student';
User.register();
