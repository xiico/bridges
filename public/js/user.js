function UserViewModel() {
    this.isEditing = ko.observable(false);
    this.info = ko.observable(userMotto);
}

var viewModel = new UserViewModel();

viewModel.editStatus = ko.pureComputed(function () {
    return this.isEditing() ? "fa fa-check-circle" : "fa fa-pencil";
}, viewModel);

ko.applyBindings(viewModel);


function updateMotto() {
    if (!viewModel.isEditing()) {
        $.post("/updatemotto", { motto: viewModel.info() }).done(function (result) {
            if (result.status == "OK")
                $.notify({
                    title: '<strong>Success!</strong>',
                    message: result.message
                }, { type: 'success' });
            else
                $.notify({
                    title: '<strong>Error!</strong>',
                    message: result.message
                }, { type: 'error' });
        });
    }
}