function SearchCEP(cep) {
    $.ajax({
        url: 'http://correiosapi.apphb.com/cep/' + cep,
        dataType: 'jsonp',
        crossDomain: true,
        contentType: "application/json",
        statusCode: {
            200: function(data) {
                console.log(data);
                $('#inputCity').val(data.cidade);
                $('#inputNeighborhood').val(data.bairro);
                $('#inputAddress').val(data.logradouro);
                $('#inputStateSelect').val(data.estado);
            },
            400: function (msg) { console.log(msg); }, // Bad Request
            404: function (msg) { console.log("CEP não encontrado!!"); } // Not Found
        }
    });
}
/*{
    bairro: "Setor Institucional"
    cep: "76872862"
    cidade: "Ariquemes"
    estado: "RO"
    logradouro: "Rio Madeira "
    tipodelogradouro: "Rua"
}*/
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