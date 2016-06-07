
function SettingsController()
{

// bind event listeners to button clicks //
	var that = this;

// handle account deletion //
	$('#confirm-delete').click(function() { that.deleteAccount(); });
	
	this.deleteAccount = function()
	{
		var that = this;
		$.ajax({
			url: '/delete',
			type: 'POST',
			data: { id: $('#userId').val()},
			success: function(data){
	 			window.location = '/';
			},
			error: function(jqXHR){
				console.log(jqXHR.responseText+' :: '+jqXHR.statusText);
			}
		});
	}
}

SettingsController.prototype.onUpdate = function(title, msg)
{
	$('#modal-alert h4').text(title);
	$('#modal-alert .modal-body p').html(msg);
}