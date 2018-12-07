// Edit Company Name Button
$('#editCompanyNameButton').click(function() {
  $('#editCompany').show();
  $(this).hide();
  $('#cancelEditCompanyNameButton').show();
})

// Cancel Edit Company Name Button
$('#cancelEditCompanyNameButton').click(function() {
  $('#editCompanyNameButton').show();
  $('#editCompany').hide();
  $(this).hide();
})


$(function() {

  // Auto Select County
  if($('#countyId').val()) {
    let id = $('#countyId').val();
    let name = $('#' + id).attr('title');
    $('#'+id).addClass('land-selected');
    $('#countyName').html(name);
    $('#selectedCounty').html(name).removeClass('alert alert-danger').addClass('alert alert-success');
  }

  // When County is clicked, add it to the CountyName input.
  $('.land').click(function () {
    let id = $(this).attr('id');
    let name = $(this).attr('title');
    $('#countyId').val(id);
    $('#countyName').val(name);
    $('#selectedCounty').html(name).removeClass('alert alert-danger').addClass('alert alert-success');
    $('.land').removeClass('land-selected');
    $(this).addClass('land-selected');
  });
  
  // Add tooltip to counties to display county name on hover.
  $(function () {
    //$('.land').tooltip()
  })

})
