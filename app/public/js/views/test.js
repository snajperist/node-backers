
$(document).ready(function(){
	
	var bv = new BackersValidator();
	var bc = new BackersController();

// main login form //

	$('#backers-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			if (bv.validateForm() == false){
				return false;
			} 	else{
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') { 
				var tbl_body = document.createElement("tbody");
		    	var odd_even = false;
		    	$.each(responseText, function() {
		        	var tbl_row = tbl_body.insertRow();
		        	tbl_row.className = odd_even ? "odd" : "even";
		        	$.each(this, function(k , v) {
		            	var cell = tbl_row.insertCell();
		            	cell.appendChild(document.createTextNode(v.toString()));
		        	})        
		    	 	odd_even = !odd_even;               
		    	})
		    	$("#target_table_id").empty().append(tbl_body);
			}
		},
		error : function(e){
			bv.showBackersError('Search Failure', 'Please check search inputs');
		}
	}); 
	$('#name-tf').focus();
})