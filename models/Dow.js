var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Day of week Model
 * =============
 */

var Dow = new keystone.List('Dow', {
	map: { name: 'name' },
});

Dow.add({
    name: { type: String, initial: true},
    key: { type: Number, initial: true},
});

Dow.relationship({ ref: 'User', path: 'posts', refPath: 'categories' });
Dow.defaultSort = 'key';
Dow.defaultColumns = 'name, key';

Dow.register();