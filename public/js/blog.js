function PostViewModel() {    
    this.isLoved = ko.observable(false);   
    this.loveCount =  ko.observable();   
}

var viewModel = new PostViewModel();

viewModel.lovedChanged = ko.pureComputed(function () {
    return this.isLoved() ? "fa fa-heart" : "fa fa-heart-o";
}, viewModel);

viewModel.loveCountChanged = ko.pureComputed(function () {
    return this.loveCount() == 0 ? "No Love" : this.loveCount() + " Loved";
}, viewModel);

ko.applyBindings(viewModel);

viewModel.isLoved(isLoved);
viewModel.loveCount(loveCount);

function lovePost(postId) {
    $.post("/lovepost", { id: postId }).done(function (result) {
        if (result.status == "OK"){
            $.notify({
                title: '<strong>Success!</strong>',
                message: result.isLoved ? "Loved!" : "No Love!"
            }, { type: 'success' });
            viewModel.isLoved(result.isLoved);
            viewModel.loveCount(result.loveCount);
        } else
            $.notify({
                title: '<strong>Error!</strong>',
                message: result.message
            }, { type: 'error' });
    });
}