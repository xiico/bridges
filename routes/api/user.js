var keystone = require('keystone');
var User = keystone.list('User');
exports.updatemotto = function (req, res) {
    var userUpdater = req.user.getUpdateHandler(req);
    var data = (req.method == 'POST') ? req.body : req.query;
    userUpdater.process(data, {
        fields: 'motto',
        flashErrors: true
    }, function (err) { 
        if (err) {
            return res.apiResponse({
                status:"error",
                message: err.error});
        }
        res.apiResponse({
            status:"OK",
            motto: data.motto,
            message: "Motto updated."});
    });
}

exports.addcredits = function (req, res) {
    if (req.user == null || !req.user.isAdmin)
    {
        return res.apiResponse({
            status:"error",
            message: "not allowed."});
    }
    User.model.findById(req.body.id).exec(function (err, user) {
        if (err) {
            return res.apiResponse({
                status:"error",
                message: err.error});
        }
        user.credits += parseFloat(req.body.credits);
        user.lastCreditType = req.body.creditType;
        user.save(function (err) {
            if (err) {
                return res.apiResponse({
                    status:"error",
                    message: err.error});
            }
            res.apiResponse({
                status:"OK",
                credits: user.credits,
                message: "Credits were added!"
            });
        });        
    });
}