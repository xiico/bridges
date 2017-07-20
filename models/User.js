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
	info: { type: Types.Text, initial: true},
	site: { type: Types.Url, initial: true},
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

User.schema.methods.wasActive = function () {
	this.lastActiveOn = new Date();
	return this;
}

/**
 * Registration
 */
User.defaultColumns = 'name, email, isAdmin, canPost';
User.register();
