
$(document).ready(function(){
	
	var av = new AccountValidator();
	var sc = new SignupController();

	$('#account-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			return av.validateForm();
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') {
				av.showMessage('Success!', 'Redirecting to login page');
				setTimeout(function(){ window.location.href = '/login'; }, 2000);
			}
		},
		error : function(e){
			if (e.responseText == 'email-taken'){
			    av.showMessage('Error', 'Email is already taken');
			}	else if (e.responseText == 'username-taken'){
			    av.showMessage('Error', 'Username is already taken');
			}
		}
	});
	$('#name-tf').focus();
})