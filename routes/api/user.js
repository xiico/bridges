exports.updatemoto = function (req, res) {
    var userUpdater = req.user.getUpdateHandler(req);
    var data = (req.method == 'POST') ? req.body : req.query;
    userUpdater.process(data, {
        fields: 'moto',
        flashErrors: true
    }, function (err) { 
        if (err) {
            return res.apiResponse({
                status:"error",
                message: err.error});
        }
        res.apiResponse({
            status:"OK",
            moto: data.moto,
            message: "Moto updated."});
    });
}