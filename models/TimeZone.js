var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Gallery Model
 * =============
 */

var TimeZone = new keystone.List('TimeZone', {
	map: { name: 'text' },
});

TimeZone.add({
    value: { type: String, required: true, initial: true },
    abbr: { type: String, required: true, initial: true },
    offset: { type: Number, required: true, initial: true },
    isdst: { type: Boolean, required: true, initial: true },
    text: { type: String, required: true, initial: true },
    utc: { type: Types.TextArray, required: true, initial: true },
});

TimeZone.register();