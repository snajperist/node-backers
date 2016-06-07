
$(document).ready(function(){

	var hc = new SettingsController();
	var av = new AccountValidator();
	
	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options) {
			if(av.validateForm() == false)
				return false;
			else
				return true;
		},
		success	: function(responseText, status, xhr, $form) {
			if (status == 'success') hc.onUpdate('Updated!', 'Account successfully updated!');
		},
		error : function(e) {
			if(e.responseText == 'email-taken')
				av.showSignupError('Error', 'Email taken');
		}
	});
	$('#name-tf').focus();
	
// customize the account settings form //
	
	$('#account-form h1').text('Account Settings');
	$('#account-form #sub1').text('Here are the current settings for your account.');
	$('#account-form-btn1').html('Delete');
	$('#account-form-btn1').addClass('btn-danger');
	$('#account-form-btn2').html('Update');
	$('#confirm-delete').html('Delete');
	$('#modal-confirm h4').text('Delete account');
	$('#modal-confirm .modal-body p').html('Are you sure you wish to delete account?<br>Deleted accounts cannot be restored');
})