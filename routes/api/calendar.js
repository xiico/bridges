var keystone = require('keystone');
var CalendarEvent = keystone.list('CalendarEvent');
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
	var userid = res.locals.user ? res.locals.user.id : null;
	var qid = req.query.userid;
	var isOwner = res.locals.user && res.locals.user.id == qid;

	if(!userid || !qid || userid != qid) return res.send({"error":"not found."});	

	var search;
	if (!locals.user.isStudent){
		search = {owner: qid};
	} else { search = {"participants": {_id:userid}}}

	var q = keystone.list('CalendarEvent').model.find(search, { _id: 0 }).populate('participants', 'name').lean();

	//studente one - 5988b355b877951a0822b510
	//studente two - 5988b39cb877951a0822b511
	q.exec(function (err, result) {
		if (err) return err;
		if (!result) res.send({ "error": "no events." });
		if (isOwner)
			return res.send(result);
		else {
			for (var i = 0, e; e = result[i]; i++) {
				if (!(e.participants && e.participants.some(function (p) { return p._id.equals(userid) }))) {
					result[i] = { start: (result[i].allDay ? result[i].start.toISOString().substr(0,10) : result[i].start.toISOString()), rendering: 'background', className:'fc-business-container' };
					if(result[i].end)
						result[i].end= result[i].end.toISOString();
				}
			}
		}
		return res.send(result);
	});
}


/**
 * Create a Post
 */
exports.create = function (req, res) {
	var item = new CalendarEvent.model(),
		data = (req.method == 'POST') ? req.body : req.query;
		item.getUpdateHandler(req).process(data, function (err) {
		if (err) return res.apiError('error', err);
		var evt = JSON.parse(JSON.stringify(item));
		delete evt._id;
		res.apiResponse(evt);
	});
}