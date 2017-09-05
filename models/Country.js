var keystone = require('keystone');
var Types = keystone.Field.Types;

/**
 * Day of week Model
 * =============
 */

var Country = new keystone.List('Country', {
	map: { name: 'name' },
});

Country.add({
    name: { type: String, initial: true},
    alpha2Code: { type: String, initial: true},
    flag: { type: String, initial: true},
    translations: {type: String}
});

Country.defaultColumns = 'name, alpha2Code';

Country.register();
// {
//     "translations": {
//         "br": "Afeganistão",
//         "pt": "Afeganistão",
//         "nl": "Afghanistan",
//         "hr": "Afganistan",
//         "de": "Afghanistan",
//         "es": "Afganistán",
//         "fr": "Afghanistan",
//         "ja": "アフガニスタン",
//         "it": "Afghanistan"
//     },
//     "flag": "https://restcountries.eu/data/afg.svg",
//     "name": "Afghanistan",
//     "alpha2Code": "AF"
// }