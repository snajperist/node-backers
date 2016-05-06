
$(document).ready(function(){
	
	var bv = new JournalistsValidator();
	var pl = false;

// main login form //

	$('#journalists-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options) {
			if (bv.validateForm() == false || bv.validateCaptcha(pl) == false) {
				return false;
			} else {
				pl = true;
				$('.spinner2').show();
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form){
			if (status == 'success') { 
				var tbl_thead = '<thead><tr><th>Name</th><th></th><th>Category</th><th>Description</th><th>Contact</th></tr></thead>';
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
	        		if(Object.prototype.toString.call(this['category']) !== '[object Array]')
	        			cell.innerHTML = this['category'].toString();
	        		else if(this['category'].length < 3)
	        			cell.innerHTML = this['category'].join(', ').toString();
	        		else if(this['category'].length < 30)
	        			cell.innerHTML = (this['category'].join(', ').toString().substring(0,36) + '... ');
	        		else
	        			cell.innerHTML = '';
	        			
	        		var cell = tbl_row.insertCell();
	        		cell.innerHTML = (this['desc'].toString().substring(0,190) + (this['desc'].toString().length >= 190 ? '... ' : '')).replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+[a-z])/g, '*****@****.***').replace(/@[a-zA-Z0-9._-]+/g, '@******').replace(/\.com\/[a-zA-Z0-9._-]+/g, '.com/*****');
	        		
	        		var	cell = tbl_row.insertCell();
	        		cell.innerHTML = '<a target="_blank" href="contact-journalists?id=' + this['_id'] + '"><button type="submit" class="btn btn-primary"><i style="padding-right: 5px;" class="icon-search icon-magnifier"></i>Get contact details</button></a>';

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
			$('.spinner2').hide();
		},
		error : function(e){
			$('.spinner2').hide();
			bv.showJournalistsError('Search Failure', 'Please check search inputs');
		}
	});
	setTimeout(function() { $('#journalists-form button').trigger('click'); }, 1200);
	$('#category').focus();
})