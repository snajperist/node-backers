
function BackersValidator(){

// bind a simple alert window to this controller to display any errors //

	this.backersErrors = $('#modal-alert');
	this.backersErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showBackersError = function(t, m)
	{
		$('#modal-alert .modal-title').text(t);
		$('#modal-alert p').text(m);
		this.backersErrors.modal('show');
	}
}

BackersValidator.prototype.validateForm = function()
{
	if ($('#platform').val().length > 30 || $('#category').val().length > 30 || $('#location-tf').val().length > 30 || $('#backed-tf').val().length > 3){
		this.showBackersError('Whoops!', 'Search input text is too long. Please check all inputs');
		return false;
	}	else
		return true;
}