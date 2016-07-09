
$(document).ready(function(){
	
	var lv = new ResetValidator();

	$('#reset-form').ajaxForm({
		success	: function(responseText, status, xhr, $form) {
			lv.showResetError('Success!', responseText);
			setTimeout(function(){ window.location.href = '/login'; }, 2000);
		},
		error : function(e){
			lv.showResetError('Reset Failure', e.responseText);
		}
	}); 
	$('#email-tf').focus();
})