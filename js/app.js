const baseUrl= "http://localhost:8080/rest-api/servicios";
var _cCliente;

$(document).ready(
    function () {
        obtenerClientes();

        $(function () {
            $('[data-toggle="tooltip"]').tooltip()
          })

        $('#new-client').click(function(e) {
            limpiarCamposCliente();
            clearAlerts();
            $('#save-client').text('Guardar');
        });

        $('#save-client').click(function(e) {
            e.preventDefault();
            clearAlerts();

            if($('#cliente-nombre').val().length > 0 && $('#cliente-direccion').val().length > 0 && $('#cliente-telefono').val().length > 0) {
                var cliente = {"nombre": $('#cliente-nombre').val(),
                    "direccion": $('#cliente-direccion').val(),
                    "telefono": $('#cliente-telefono').val()
                };
                if($(this).text() == 'Guardar') {
                    guardarCliente(cliente);
                } else {
                    actualizarCliente(cliente);
                }
            } else {
                showAlertMsgOnModal('warning', 'Debe llenar todos los campos');
            }
        });

        $('#clienteModal').on('show.bs.modal', function (event) {
            $('#result-message').html('');
        });

        $('body #lista-clientes').on('click', 'button', function(){
            clearAlerts();
            botonId= ($(this).attr('id'));
            _cCliente=$(this).attr('data');
            if('edit' == botonId.substring(0,4)) {
                row= $(this).parents('tr');
                cols= row.children("td");
                $('#cliente-nombre').val($(cols[1]).text());
                $('#cliente-direccion').val($(cols[2]).text());
                $('#cliente-telefono').val($(cols[3]).text());
                $('#save-client').text('Actualizar');
                $('#clienteModal').modal('show');
            } else {
                row= $(this).parents('tr');
                cols= row.children("td");
                $('#delete-msg').text($(cols[1]).text() + ' con código: ' + $(cols[0]).text());
                $('#confirm-delete-dlg').modal('toggle');
            }
        });

        $('#delete-client').click(function(e) {
            e.preventDefault();
            $('#confirm-delete-dlg').modal('toggle');
            borrarCliente();
        });

        $('#result-message-close-btn').click(function(e) {
            e.preventDefault();
            $('#result-message').hide();
        });
    }
);

function limpiarCamposCliente() {
    $('#cliente-nombre').val('');
    $('#cliente-direccion').val('');
    $('#cliente-telefono').val('');
    $('#result-modal-message').html('');
    //$('#clienteModal').modal('toggle');
}

function obtenerClientes() {
    showLoadingAnimation(true);
    $.ajax({
        type: "get",
        data: "",
        url: baseUrl + "/cliente-servicio/list-clientes",
        success: function(result,status,xhr) {
            $('#lista-clientes').html(getHtmlTable(result));
        },
        error: function(xhr,status,error) {
            if(xhr.status == 404) {
                showAlertMsg('danger', 'Error ' + xhr.status + ': No se encontró el servicio especificado.')
            } else if (xhr.status == 500) {
                showAlertMsg('danger', 'Error ' + xhr.status + ': Error interno del servicio.')
            } else if (xhr.status == 0 && xhr.statusText == 'error') {
                showAlertMsg('danger', 'Error ' + xhr.status + ': No se ha podido establecer conexión con el servidor.')
            }
        },
        complete: function(jqXHR, textStatus) {
            showLoadingAnimation(false);
        }
    });
}

function getHtmlTable(jsonNodes) {
    // Table
    var htmlTable = $('<table>').addClass('table table-striped').attr('id','clientes-dt');

    // Header.
    var row = $('<tr>');
    row.append( $('<th>').text('Codigo') );
    row.append( $('<th>').text('Nombre') );
    row.append( $('<th>').text('Direccion'));
    row.append( $('<th>').text('Teléfono'));
    row.append( $('<th>').width("20%").text('Acciones'));
    htmlTable.append('<thead>').children('thead').append(row);

    // Body.
    var tbody = $('<tbody>');

    // Children.
    for(var i=0; i < jsonNodes.length; ++i) {

      // Row.
      row = $('<tr>');

      // Name.
      row.append( $('<td>').text(jsonNodes[i].codigo) );
      row.append( $('<td>').text(jsonNodes[i].nombre) );
      row.append( $('<td>').text(jsonNodes[i].direccion) );
      row.append( $('<td>').text(jsonNodes[i].telefono) );

      cell= $('<td>');
      span= $('<span>').addClass('fas fa-user-edit');
      boton= $('<button>').addClass('btn btn-light ml-1').
            attr('id', 'edit_' + jsonNodes[i].codigo).
            attr('data', jsonNodes[i].codigo);
      boton.append(span);
      cell.append(boton);
      
      span= $('<span>').addClass('fas fa-trash-alt');
      boton= $('<button>').addClass('btn btn-light ml-1').
            attr('id', 'delete_' + jsonNodes[i].codigo).
            attr('data-toggle', 'tooltip').
            attr('data', jsonNodes[i].codigo);
      boton.append(span);
      cell.append(boton);

      row.append(cell);

      tbody.append(row);
    }

    htmlTable.append(tbody);
    return htmlTable;
}


function guardarCliente(cliente) {
    showLoadingAnimation(true);
    $.ajax({
        type: "post",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(cliente),
        url: baseUrl + "/cliente-servicio/crear",
        success: function(result,status,xhr) {
            limpiarCamposCliente();
            showAlertMsgOnModal('success', 'Cliente creado correctamente.');
            obtenerClientes();
        },
        error: function(xhr,status,error) {
            showAlertMsgOnModal('danger', 'Ocurrio un error.');
        },
        complete: function(jqXHR, textStatus) {
            showLoadingAnimation(false);
        }
    });
}

function actualizarCliente(cliente) {
    showLoadingAnimation(true);
    $.ajax({
        type: "post",
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(cliente),
        url: baseUrl + "/cliente-servicio/actualizar/" + _cCliente,
        success: function(result,status,xhr) {
            limpiarCamposCliente();
            $('#clienteModal').modal('toggle');
            showAlertMsg('success', 'Cliente actualizado correctamente.')
            obtenerClientes();
        },
        error: function(xhr,status,error) {
            showAlertMsg('danger', 'Ocurrio un error.')
        },
        complete: function(jqXHR, textStatus) {
            showLoadingAnimation(false);
        }
    });
}

function borrarCliente() {
    showLoadingAnimation(true);
    $.ajax({
        type: "delete",
        data: "",
        url: baseUrl + "/cliente-servicio/borrar/" + _cCliente,
        success: function(result,status,xhr) {
            showAlertMsg('success', 'Cliente borrado correctamente.');
            obtenerClientes();
        },
        error: function(xhr,status,error) {
            showAlertMsg('danger', 'Ocurrio un error.')
        },
        complete: function(jqXHR, textStatus) {
            showLoadingAnimation(false);
        }
    });
}

function showLoadingAnimation(estado) {
    if(estado) {
        $('#loading-animation').
            removeClass('spinner-border text-primary d-none').
            addClass('spinner-border text-primary d-inline-block');
    } else {
        $('#loading-animation').
        removeClass('spinner-border text-primary d-inline-block').
        addClass('spinner-border text-primary d-none');
    }
}

function showAlertMsg(tipo, mensaje) {
    $('#result-message-container').
        append("<div class='alert alert-" + tipo + " alert-dismissable fade show' role='alert' id='myAlert2'>" + 
                    mensaje + 
                    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" + 
                        "<span aria-hidden='true'>&times;</span>" + 
                    "</button>" + 
               "</div>");
}

function showAlertMsgOnModal(tipo, mensaje) {
    $('#result-modal-message-container').
        append("<div class='alert alert-" + tipo + " alert-dismissable fade show' role='alert' id='myAlert2'>" + 
                    mensaje + 
                    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'>" + 
                        "<span aria-hidden='true'>&times;</span>" + 
                    "</button>" + 
               "</div>");
}

function clearAlerts() {
    $(".alert").alert('close');
}