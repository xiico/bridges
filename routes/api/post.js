var keystone = require('keystone');
var Post = keystone.list('Post');
exports.lovepost = function (req, res) {
    Post.model.findById(req.body.id).exec(function (err, post) {
        if (post.loved.indexOf(req.user.id) == -1 )
            post.loved.set(post.loved.length, req.user.id);
        else
            post.loved.splice(post.loved.indexOf(req.user.id), 1)
        post.save(function (err) {
            if (err) {
                return res.apiResponse({
                    status:"error",
                    message: err.error});
            }
            res.apiResponse({
                status:"OK",
                isLoved: (post.loved.indexOf(req.user.id) != -1),
                loveCount: post.loved.length
            });
        });        
    });
    /*var userUpdater = req.user.getUpdateHandler(req);
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
    });*/
}