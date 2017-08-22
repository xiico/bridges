var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
var User = new keystone.List('User');

User.add({
	name: { type: Types.Name, required: true, index: true },
	photo: { type: Types.CloudinaryImage, collapse: true },
	password: { type: Types.Password, initial: true, required: true },
	info: { type: Types.Html, wysiwyg: true, height: 400 },
	moto: { type: String, height: 400 },
	site: { type: Types.Url, initial: true},
	timezone: { type: Types.Relationship, ref: 'TimeZone', index: true },
	registered: { type: Types.Date, required: true, initial: true },
	startBusinessHours: { type: Types.Select, options: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'], default: '09', index: true },
	endBusinessHours: { type: Types.Select, options:   ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'], default: '18', index: true },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
	canPost: { type: Boolean, label: 'Can write posts', index: true },
	isTeacher: { type: Boolean, label: 'Teacher', index: true },
	isStudent: { type: Boolean, label: 'Student', index: true }
}, 'Contact',{
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	cellphone: {type: Types.Number, format: '(00) 00000 0000', required: true, initial: true}

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
