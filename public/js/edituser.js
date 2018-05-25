function SearchCEP(cep) {
    $.ajax({
        //url: 'http://correiosapi.apphb.com/cep/' + cep,
        url: 'https://viacep.com.br/ws/' + cep + '/json/',
        dataType: 'jsonp',
        crossDomain: true,
        contentType: "application/json",
        statusCode: {
            200: function(data) {
                console.log(data);
                $('#inputCity').val(data.localidade);
                $('#inputNeighborhood').val(data.bairro);
                $('#inputAddress').val(data.logradouro);
                $('#inputStateSelect').val(data.uf);
            },
            400: function (msg) { console.log(msg); }, // Bad Request
            404: function (msg) { console.log("CEP não encontrado!!"); } // Not Found
        }
    });
}
/*
{
  "cep": "01257-090",
  "logradouro": "Rua Padre Agostinho Mendicute",
  "complemento": "",
  "bairro": "Sumaré",
  "localidade": "São Paulo",
  "uf": "SP",
  "unidade": "",
  "ibge": "3550308",
  "gia": "1004"
} */
function montaUF(pais){
    if(pais == 'BR') {
        $('#inputStateSelect').removeClass('hidden')
        $('#inputStateText').addClass('hidden')
        $('#searchZip').removeClass('disabled')
    } else {
        $('#inputStateSelect').addClass('hidden')
        $('#inputStateText').removeClass('hidden')
        $('#searchZip').addClass('disabled');
    }
	$.ajax({
		type:'GET',
		url:'http://api.londrinaweb.com.br/PUC/Estados/'+pais+'/0/10000',
		contentType: "application/json; charset=utf-8",
		dataType: "jsonp",
		async:false
	}).done(function(response){
		states='';
		$.each(response, function(e, state){
			states+='<option value="'+state.UF+'">'+state.Estado+'</option>';
		});
		// PREENCHE OS ESTADOS BRASILEIROS
		$('#inputStateSelect').html(states);

	});
}

function UserViewModel() {
    this.credits = ko.observable(userCredits);
}

var viewModel = new UserViewModel();

viewModel.creditBalance = ko.pureComputed(function () {
    if (viewModel.credits() >= 8)
        return "progress-bar-success";
    else if (viewModel.credits() >= 4 && viewModel.credits() < 8)
        return "progress-bar-warning";
    else
        return "progress-bar-danger";
}, viewModel);


viewModel.barWidth = ko.pureComputed(function () {
    return (Math.min(1, viewModel.credits() / 20) * 100).toString() + "%";
}, viewModel);

ko.applyBindings(viewModel);

function addCredits() {
    $.post("/addcredits", { id: userID, credits: $('#creditValue').val(), creditType: $('#creditType').val()}).done(function (result) {
        if (result.status == "OK"){
            $.notify({
                title: '<strong>Success!</strong>',
                message: result.message                
            }, { type: 'success' });
            viewModel.credits(result.credits);
        } else
            $.notify({
                title: '<strong>Error!</strong>',
                message: result.message
            }, { type: 'error' });
    });
}