
$(document).ready(function(){

// main login form //

	var jv = new JournalistsValidator();
	var ev = new EmailValidator();

	$('#journalists-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options){
			$('.spinner2').show();
			return true;
		},
		success	: function(responseText, status, xhr, $form){
			if(status == 'success' && jQuery.type(responseText) === "array") { 
				var tbl_thead = '<thead><tr><th>Name</th><th></th><th>Country</th><th>Twitter</th><th>Email</th><th>Phone</th><th>Category</th><th>Description</th><th>Contact</th></tr></thead>';
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
	        		cell.innerHTML = (this['country'] == undefined ? '' : this['country'].toString());
	        		
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
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = '<a target="_blank"><button type="submit" class="btn btn-primary"><i style="padding-right: 5px;" class="icon-search icon-envelope"></i>Contact</button></a>';

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
			
			$('#journalists_table a').click(function(event) {
				$('#send-form').removeClass('hidden');
				$('#to').val('');
				var columns = $(event.target).parent().parent().parent().children();
				$('#to').val(columns.eq(4).text());
				window.scrollTo(0,$("#send-form").offset().top-50);
				$('#to').val(columns.eq(4).text());
				$("#subject").focus();
			});
		},
		error : function(e){
			$('.spinner2').hide();
		}
	}); 	
	
		
	$('#send-form').ajaxForm({
		beforeSubmit : function(formData, jqForm, options) {
			if(!ev.validateEmail($('#to').val().trim())) {
				jv.showJournalistsError('Incorrect Email Address', 'Please check email address');
				return false;
			}
	
			if(jv.validateSendFormSubject() == false || jv.validateSendFormMessage() == false)
				return false;
			else {
				$('.spinner2').show();
				window.scrollTo(0, 0);
				return true;
			}
		},
		success	: function(responseText, status, xhr, $form) {
			jv.showContacted();
			$('.spinner2').hide();
		},
		error : function(e) {
			$('.spinner2').hide();
			jv.showJournalistsError('Sending Failed', e.responseText + ' Please check inputs or contact support.');
		}
	});
	
	setTimeout(function() { $('#journalists-form button').trigger('click'); }, 1200);
	//setTimeout(function() { if(window.location.href.toString().indexOf('id=') != -1) { jv.showContacted(); } }, 1800);
})