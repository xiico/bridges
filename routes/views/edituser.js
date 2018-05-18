var keystone = require('keystone');
var User = keystone.list('User');

exports = module.exports = function (req, res) {

    var view = new keystone.View(req, res);
    var locals = res.locals;

    // Set locals
    locals.section = 'edituser';
    locals.formData = req.body || {};
    locals.validationErrors = {};
    locals.userSubmitted = false;

    if(!locals.user.isAdmin && req.params.id != locals.user.id) return view.render('errors/404');	

    	// Load the current post
	view.on('init', function (next) {        
        var q = keystone.list('Country').model.find();
        q.exec(function (err, result) {
            locals.countries = result;
            next(err);
        });
    });


    view.query('profile', keystone.list('User').model.findOne({_id:req.params.id}).populate('timezone'));

    // On POST requests, add the Enquiry item to the database
    view.on('post', { action: 'edituser' }, function (next) {
        User.model.findById(req.body.id).exec(function (err, event) {

            var editUser = new User.model();
            var updater = editUser.getUpdateHandler(req);
            updater.process(req.body, {
                flashErrors: true,
                fields: 'name, email, phone, enquiryType, message',
                errorMessage: 'There was a problem submitting your enquiry:',
            }, function (err) {
                if (err) {
                    locals.validationErrors = err.errors;
                } else {
                    locals.enquirySubmitted = true;
                }
                next();
            });
        });
    });

    view.render('edituser');
};
