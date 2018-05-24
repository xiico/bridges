// // create the model for users and expose it to our app
var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * CreditHistory Model
 * ==========
 */
var CreditHistory = new keystone.List('CreditHistory', {
	map: { name: 'type' },
});

CreditHistory.add({
	type: { type: Types.Select, options: 'class, refund, bought, gift', default: 'class', index: true },
	owner: { type: Types.Relationship, ref: 'User', index: true, required: true, initial: true },
    date: { type: Types.Datetime, index: true, required: true, initial: true },
    before: { type: Number, initial: true},
    amount: { type: Number, initial: true},
    after: { type: Number, initial: true}
});

CreditHistory.schema.virtual('ID').get(function () { return this._id; });
CreditHistory.defaultColumns = 'type, owner|20%, date|20%, amount';
CreditHistory.register();