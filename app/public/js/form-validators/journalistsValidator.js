
function JournalistsValidator(){

// bind a simple alert window to this controller to display any errors //

	this.journalistsErrors = $('#modal-alert');
	this.journalistsErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showJournalistsError = function(t, m)
	{
		$('#modal-alert .modal-title').text(t);
		$('#modal-alert p').text(m);
		this.journalistsErrors.modal('show');
	}
}

JournalistsValidator.prototype.validateForm = function()
{
	if($('#keyword').val().length > 30){
		this.showJournalistsError('Whoops!', 'Search input text is too long. Please check all inputs');
		return false;
	} else
		return true;
}

JournalistsValidator.prototype.validateCaptcha = function(pl)
{
	var v = grecaptcha.getResponse();
	if(pl && v.length == 0) {
        this.showJournalistsError('Captcha isn\'t solved', 'Please check captcha');
        return false;
    }
    else
        return true; 
}