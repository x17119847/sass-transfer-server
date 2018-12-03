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