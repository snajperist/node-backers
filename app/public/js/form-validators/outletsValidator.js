
function OutletsValidator(){

// bind a simple alert window to this controller to display any errors //

	this.outletsErrors = $('#modal-alert');
	this.outletsErrors.modal({ show : false, keyboard : true, backdrop : true });

	this.showOutletsError = function(t, m)
	{
		$('#modal-alert .modal-title').text(t);
		$('#modal-alert p').text(m);
		this.outletsErrors.modal('show');
	}
}

OutletsValidator.prototype.validateForm = function()
{
	if ($('#keyword').val().length > 30){
		this.showOutletsError('Whoops!', 'Search input text is too long. Please check all inputs');
		return false;
	}	else
		return true;
}