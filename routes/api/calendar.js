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

	//if(!userid || !qid || (userid != qid && (!locals.user.isStudent && !locals.user.isAdmin && !isOwner))) return res.send({"error":"not found."});	

	var search = {
		$or: [
			{owner: qid},
			{"participants": {_id:qid}}
		]
	};
	// if ((locals.user.isStudent && !isOwner) || locals.user.isTeacher){
	// 	search = {owner: qid};
	// } else { search = {"participants": {_id:userid}}}

	var q = keystone.list('CalendarEvent').model.find(search/*, { _id: 0, categories: 0 }*/).populate('participants', 'name').lean();

	//studente one - 5988b355b877951a0822b510
	//studente two - 5988b39cb877951a0822b511
	q.exec(function (err, result) {
		if (err) return err;
		if (!result) res.send({ "error": "no events." });
		if (isOwner || locals.user.isAdmin) {
			var events = result;
			events.forEach(function(event) {
				event.id = event._id;
				delete event._id;
			}, this);
			return res.send(events);
		} else {
			for (var i = 0, e; e = result[i]; i++) {
				if (!e.participants || !e.participants.some(function (p) { return p._id.equals(userid) })) {
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
 * Create an Event
 */
exports.create = function (req, res) {
	var item = new CalendarEvent.model(),
		data = (req.method == 'POST') ? req.body : req.query;

	var credits = Math.abs(new Date(data.end) - new Date(data.start)) / 60 / 1000 / 60;

	var resultCredits = req.user.credits - credits;

	if (resultCredits < 0) return res.apiError('error', { error: 'Not enough credits.' });
	
	var updater = req.user.getUpdateHandler(req);

	item.getUpdateHandler(req).process(data, function (err) {
		if (err) return res.apiError('error', err);
		updater.process({ credits: resultCredits }, {
			fields: 'credits',
			flashErrors: true
		}, function (err, test) {
			if (err) return res.apiError('error', err);
			var evt = JSON.parse(JSON.stringify(item));
			evt.credits = resultCredits;
			delete evt._id;
			evt.newEvent = true;
			res.apiResponse(evt);
		});
	});
}




function response(err, res, event, resultCredits) {
	if (err) return res.apiError('error', err);
	var evt = JSON.parse(JSON.stringify(event));
	if(resultCredits) evt.credits = resultCredits;
	delete evt._id;
	res.apiResponse(evt);
}

/**
 * Update an Event
 */
exports.update = function (req, res) {
	CalendarEvent.model.findById(req.body._id).populate('participants', 'name').exec(function (err, event) {
		var data = (req.method == 'POST') ? req.body : req.query;
		var credits = null;
		var resultCredits = null;

		if (data.start) {
			credits = Math.abs(new Date(data.end) - new Date(data.start)) / 60 / 1000 / 60;
			//var result = Math.abs(new Date() - new Date(window.calendarEvent.start.toISOString())) / 1000 / 60 / 60;
			var message;
			if (credits >= 24) message = { type: 'alert-info', message: 'All your credits will be refunded for this class.' };
			if (credits < 24 && result > 12) message = { type: 'alert-warning', message: 'You will only be refunded half your credits.' };
			if (credits <= 12) message = { type: 'alert-danger', message: 'No credits will be refunded.' };

			resultCredits = req.user.credits - credits;

			if (resultCredits < 0) return res.apiError('error', { error: 'Not enough credits.' });
		}
		var userUpdater = req.user.getUpdateHandler(req);
		event.getUpdateHandler(req).process(data, {
			fields: 'state',
			flashErrors: true
		}, function (err, test) {
			if (err) return res.apiError('error', err);
			if (resultCredits)
				userUpdater.process({ credits: resultCredits }, {
					fields: 'credits',
					flashErrors: true
				}, function (err) { response(err, res, event, resultCredits); });
			else {
				//event.credits = req.user.credits;
				response(err, res, event);
			}
		});
	});
}