function AccountValidator(){

// bind a simple alert window to this controller to display any errors //

	this.signupErrors = $('#modal-alert');
	this.signupErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showSignupError = function(t, m)
	{
		$('#modal-alert .modal-header h4').text(t);
		$('#modal-alert .modal-body p').text(m);
		this.signupErrors.modal('show');
	}
	
	this.validateEmail = function(e)
	{
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(e);
	}
}

AccountValidator.prototype.validateForm = function()
{
	if ($('#name-tf').val() == undefined || $('#name-tf').val().length < 4){
		this.showSignupError('Whoops!', 'Please enter a valid name');
		return false;
	}	else if ($('#pass-tf').val() == undefined || $('#pass-tf').val().length < 6){
		this.showSignupError('Whoops!', 'Please enter a valid password');
		return false;
	}	else if ($('#email-tf').val() == undefined || !this.validateEmail($('#email-tf').val())){
		this.showSignupError('Whoops!', 'Please enter a valid email');
		return false;
	}	else if ($('#user-tf').val() == undefined || $('#user-tf').val().length < 2){
		this.showSignupError('Whoops!', 'Please enter a valid username');
		return false;
	}	else{
		return true;
	}
}

AccountValidator.prototype.showMessage = function(t,m)
{
	this.showSignupError(t, m);
}