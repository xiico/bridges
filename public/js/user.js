function UserViewModel() {
    this.isEditing = ko.observable(false);
    this.info = ko.observable(userMoto);
}

var viewModel = new UserViewModel();

ko.applyBindings(viewModel);