
$(document).ready(function(){
	
	var ac = new AdminController();

// settings form //
	$('#settings-form').ajaxForm({
		success	: function(responseText, status, xhr, $form) {
			ac.onUpdate('Updated!', 'Settings successfully updated!');
		},
		error: function() {
			ac.onUpdate('Error!', 'Error updating!');
		}
	});
})