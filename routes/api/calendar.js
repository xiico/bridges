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

	var search = {	$or: [{owner: qid},	{"participants": {_id:qid}},{"participants": {_id:userid}}	],
				   $nor: [{"state": "canceled"},{"state": "archived"}]};

	var q = keystone.list('CalendarEvent').model.find(search/*, { _id: 0, categories: 0 }*/).populate('owner', 'name').populate('participants', 'name isStudent').lean();

	//studente one - 5988b355b877951a0822b510
	//studente two - 5988b39cb877951a0822b511
	q.exec(function (err, events) {
		if (err) return err;
		if (!events) res.send({ "error": "no events." });
		var eventsToClient = events.slice();
		if (isOwner || locals.user.isAdmin) {
			eventsToClient = events.slice();
			eventsToClient.forEach(function(event) {
				event.id = event._id;
				delete event._id;
			}, this);
			return res.send(eventsToClient);
		} else {
			for (var i = 0, e; e = events[i]; i++) {
				if (!e.participants || !e.participants.some(function (p) { return p._id.equals(userid) })) {
					eventsToClient[i] = { 
						start: (events[i].allDay ? events[i].start.toISOString().substr(0,10) : events[i].start.toISOString()), 
						rendering: 'background', 
						className:'fc-business-container' 
					};
					if(events[i].end)
						eventsToClient[i].end= events[i].end.toISOString();
				}
			}
		}
		return res.send(eventsToClient);
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

	if ((isNaN(resultCredits) || resultCredits < 0) && req.user.isStudent ) return res.apiError('error', { error: 'Not enough credits.' });
	if(req.user.isStudent){
		if (credits < 1.5) return res.apiError('error', { error:'The min class duration is 01:30' });
		if (credits > 4) return res.apiError('error', { error:'The max class duration is 04:00' });
	}
	var updater = req.user.getUpdateHandler(req);

	item.getUpdateHandler(req).process(data, function (err) {
		if (err) return res.apiError('error', err);
		updater.process({ credits: resultCredits }, {
			fields: 'credits',
			flashErrors: true
		}, function (err, test) {
			if (err) return res.apiError('error', err);
			CalendarEvent.model.findById(item._id).populate('participants', 'name').exec(function (err, event) {
				var evt = JSON.parse(JSON.stringify(event));
				// evt.credits = resultCredits;
				// evt.message = 'Your class has been booked.';
				// delete evt._id;
				// evt.newEvent = true;
				// res.apiResponse(evt);
				evt.newEvent = true;
				response(err, res, evt, resultCredits, 'Your class has been booked.')
			});
		});
	});
}

function response(err, res, event, resultCredits, message) {
	var rsp = {};
	if (err) return res.apiError('error', err);
	if(resultCredits) rsp.credits = resultCredits;
	if(message) rsp.message = message;
	event.id = event._id;
	delete event._id;
	rsp.event = event;
	res.apiResponse(rsp);
}

/**
 * Update an Event
 */
exports.update = function (req, res) {
	CalendarEvent.model.findById(req.body.id).populate('participants', 'name').exec(function (err, event) {
		var data = (req.method == 'POST') ? req.body : req.query;
		var credits = null;
		var resultCredits = null;
		var refund = null;

		if (data.state == 'canceled') {
			credits = Math.abs(new Date(event.end) - new Date(event.start)) / 60 / 1000 / 60;
			var result = Math.abs(new Date() - new Date(event.start.toISOString())) / 1000 / 60 / 60;
			var message;
			refund = { total: 0, message: 'There was no refund.' };
			if (result >= 24) refund = { total: credits, message: 'All your credits were refunded for this class.' };//'All your credits were refunded for this class.'
			if (result < 24 && result > 12) refund = { total: credits / 2, message: 'You was refunded half your credits.' };//'You was refunded half your credits.'
			//if (result <= 12) //'There was no refund.

			resultCredits = req.user.credits + refund.total;
			//if (resultCredits < 0) return res.apiError('error', { error: 'Not enough credits.' });
		} else if (data.state == 'accepted') refund = { total: 0, message: 'The class has been accepted.' };
		var userUpdater = req.user.getUpdateHandler(req);
		event.getUpdateHandler(req).process(data, {
			fields: 'state',
			flashErrors: true
		}, function (err) {
			if (err) return res.apiError('error', err);
			if (resultCredits)
				userUpdater.process({ credits: resultCredits }, {
					fields: 'credits',
					flashErrors: true
				}, function (err) { 
					var evt = JSON.parse(JSON.stringify(event));
					response(err, res, event, resultCredits, refund.message); });
			else { 
				var evt = JSON.parse(JSON.stringify(event));
				response(err, res, event, null, refund.message); 
			}
		});
	});
}