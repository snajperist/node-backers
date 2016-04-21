
$(document).ready(function(){

// main login form //

	$('#journalists-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			$('.spinner2').show();
			return true;
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success' && jQuery.type(responseText) === "array") { 
				var tbl_thead = '<thead><tr><th>Name</th><th></th><th>Twitter</th><th>Email</th><th>Phone</th><th>Category</th><th>Description</th></tr></thead>';
				var tbl_body = document.createElement("tbody");
		    	var odd_even = false;
		    	$.each(responseText, function() {
		        	var tbl_row = tbl_body.insertRow();
		        	tbl_row.className = odd_even ? "odd" : "even";

	        		var cell = tbl_row.insertCell();
	        		cell.innerHTML = '<img src="https://twitter.com/' + this['twitter'].toString() + '/profile_image?size=normal" onerror="this.src=\'/image/twitter-default.png\'" style="margin: 2px 5px 2px 0px;">';
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['name'].toString().substring(0,30) + (this['name'].toString().length >= 30 ? '... ' : '');
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['twitter'].toString();

	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['email'].toString();
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['phone'].toString();
	        		
	        		cell = tbl_row.insertCell();
	        		if(Object.prototype.toString.call(this['category']) !== '[object Array]')
	        			cell.innerHTML = this['category'].toString();
	        		else if(this['category'].length < 3)
	        			cell.innerHTML = this['category'].join(', ').toString();
	        		else if(this['category'].length < 30)
	        			cell.innerHTML = (this['category'].join(', ').toString().substring(0,36) + '... ');
	        		else
	        			cell.innerHTML = '';
	        			
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['desc'].toString().substring(0,150) + (this['desc'].toString().length >= 90 ? '... ' : '');

	    	 		odd_even = !odd_even;               
		    	})
		    	$("#journalists_table").empty().append(tbl_thead).append(tbl_body);

				if($.fn.dataTable.isDataTable('#journalists_table'))
					table.destroy();
					
			    table = $('#journalists_table').DataTable( {
			        "ordering": false,
			        "pageLength": 25,
			        "lengthChange": false,
			        bFilter: false
			    } );
			}
			else if (status == 'success') {
				
			}
			$('.spinner2').hide();
		},
		error : function(e){
			$('.spinner2').hide();
		}
	}); 
	setTimeout(function() { $('#journalists-form button').trigger('click'); }, 1200);
})