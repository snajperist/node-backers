
function JournalistsValidator() {

// bind a simple alert window to this controller to display any errors //

	this.JournalistsErrors = $('#modal-alert');
	this.JournalistsErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showJournalistsError = function(t, m)
	{
		$('#modal-alert .modal-title').text(t);
		$('#modal-alert p').text(m);
		this.JournalistsErrors.modal('show');
	}
}

JournalistsValidator.prototype.validateForm = function()
{
	if ($('#keyword').val().length > 30) {
		this.showJournalistsError('Whoops!', 'Search input text is too long. Please check all inputs');
		return false;
	}	else
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

JournalistsValidator.prototype.showContacted = function()
{
	this.showJournalistsError('Email sent!', 'Contact email has been sent. You can expect reply in your email inbox.');
}

JournalistsValidator.prototype.validateSendFormSubject = function()
{
	if($('#subject').val().length < 2 || $('#subject').val().length > 128) {
		this.showJournalistsError('Whoops!', 'Something is wrong with subject input text. Please check it before trying again.');
		return false;
	} else
		return true;
}

JournalistsValidator.prototype.validateSendFormMessage = function()
{
	if($('#message').val().length < 2 || $('#message').val().length > 10000) {
		this.showJournalistsError('Whoops!', 'Something is wrong with message input text. Please check it before trying again.');
		return false;
	} else
		return true;
}