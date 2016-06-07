
$(document).ready(function(){
	
	var ac = new AdminController();

// main login form //

	$('#accounts-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			return true;
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') { 
				var tbl_thead = '<thead><tr><th></th><th>Name</th><th>Email</th><th>Credits</th><th>Country</th><th>Date Registered</th><th>ID (Edit)</th></tr></thead>';
				var tbl_body = document.createElement("tbody");
		    	var odd_even = false;
		    	$.each(responseText, function() {
		        	var tbl_row = tbl_body.insertRow();
		        	tbl_row.className = odd_even ? "odd" : "even";
	
	        		var cell = tbl_row.insertCell();
	        		if(this.hasOwnProperty('status') && this['status'] != null) {
	        			if(this['status'].toString() == 'Admin')
	        				cell.innerHTML = '<i class="busy"></i>';
	        			else if(this['status'].toString() == 'Active')
	        				cell.innerHTML = '<i class="online"></i>';
	        			else
	        				cell.innerHTML = '<i class="away"></i>';
	        		}
	        		else
	        			cell.innerHTML = ' ';
	        			
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['name'].toString();
    		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['email'].toString();
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = (this['credits'] != undefined ? this['credits'].toString() : '-');
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['country'].toString();
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['date'].toString();
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = '<a href=#>' + this['_id'] + '</a>';
	        		
	    	 	odd_even = !odd_even;               
		    	})
		    	$("#accounts_table").empty().append(tbl_thead).append(tbl_body);

				if($.fn.dataTable.isDataTable('#accounts_table'))
					table.destroy();
					
			    table = $('#accounts_table').DataTable( {
			        "ordering": false,
			        "pageLength": 25,
			        "lengthChange": false,
			        bFilter: false
			    } );
			    
				$('#accounts_table a').click(function(event) {
					$('#edit-form').removeClass('hidden');
					var columns = $(event.target).parent().parent().children();
					if(columns.eq(0).html().indexOf('busy') != -1)
						$('#status').val('Admin');
					else if(columns.eq(0).html().indexOf('online') != -1)
						$('#status').val('Active');
					else if(columns.eq(0).html().indexOf('away') != -1)
						$('#status').val('Inactive');
					else
						$('#status').val('');
					$('#name-edit').val(columns.eq(1).text());
					$('#email-edit').val(columns.eq(2).text());
					$('#credits-edit').val(columns.eq(3).text());
					$('#country-list').val(columns.eq(4).text());
					$('#userId').val(columns.eq(6).text());
				});
			}
		},
		error : function(e){
			alert('Search Failure\nPlease check search inputs');
		}
	}); 
	
	
	$('#edit-form').ajaxForm({
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') { 
				ac.onUpdate('Updated!', 'Account successfully updated!');
				$('#edit-form').addClass('hidden');
				$('#accounts-form button').trigger('click');
			}
		},
		error: function(){
				ac.onUpdate('Error!', 'Error updating!');
				$('#accounts-form button').trigger('click');
			}
	});
	
	$('#accounts-form button').trigger('click');
	$('#user-tf').focus();
	$('#account-form-btn1').html('Delete');
	$('#account-form-btn1').addClass('btn-danger');
	$('#account-form-btn2').html('Update');
	$('#confirm-delete').html('Delete');
	$('#modal-confirm h4').text('Delete account');
	$('#modal-confirm .modal-body p').html('Are you sure you wish to delete account?<br>Deleted accounts cannot be restored');
})