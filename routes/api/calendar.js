var keystone = require('keystone');

// exports = module.exports = function (req, res) {
// 	var locals = res.locals;

// 	// Set locals
// 	locals.section = 'calendar';
// 	locals.data = {
// 		events: [],
// 		categories: [],
// 	};
// 	//locals.enquiryTypes = Enquiry.fields.enquiryType.ops;
// 	locals.formData = req.body || {};
// 	locals.validationErrors = {};
// 	locals.enquirySubmitted = false;

// 	// Load the current post
// 	view.on('init', function (next) {

// 		var q = keystone.list('CalendarEvent').model.findOne({
// 			owner: locals.user.id,
//         }).populate('owner participants');

// 		q.exec(function (err, result) {
//             if(err) return err;
// 			res.send(result);
// 		});
// 	});


// };

exports.list = function (req, res) {
	var locals = res.locals;
	if(!locals.user){
		res.send({"error":"there's no user logged in."});
		return;
	}
	var q = keystone.list('CalendarEvent').model.findOne({
		owner: locals.user.id,
	}).populate('owner participants');

	q.exec(function (err, result) {
		if (err) return err;
		if (!result) res.send({"error":"no events."});
		res.send(result);
	});
}
