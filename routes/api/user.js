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
    if (locals.user == null || !locals.user.isAdmin)
    {
        return res.apiResponse({
            status:"error",
            message: "not allowed."});
    }
    /*var userUpdater = req.user.getUpdateHandler(req);
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
    });*/
}