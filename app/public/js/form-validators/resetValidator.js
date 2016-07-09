
function ResetValidator(){

// bind a simple alert window to this controller to display any errors //

	this.loginErrors = $('#modal-alert');
	this.loginErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showResetError = function(t, m)
	{
		$('#modal-alert .modal-header h4').text(t);
		$('#modal-alert .modal-body p').text(m);
		this.loginErrors.modal('show');
	}
}

ResetValidator.prototype.validateForm = function()
{
	if ($('#email-tf').val() == ''){
		this.showResetError('Whoops!', 'Please enter a valid email');
		return false;
	}	else if ($('#pass-tf').val() == ''){
		this.showResetError('Whoops!', 'Please enter a valid password');
		return false;
	}	else {
		return true;
	}
}