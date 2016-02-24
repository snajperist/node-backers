
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
				var tbl_thead = '<thead><tr><th>Name</th><th>Platform</th><th>Category</th><th>Location</th><th>Backed</th><th>Facebook</th><th>Twitter</th></tr></thead>';
				var tbl_body = document.createElement("tbody");
		    	var odd_even = false;
		    	$.each(responseText, function() {
		        	var tbl_row = tbl_body.insertRow();
		        	tbl_row.className = odd_even ? "odd" : "even";

	        		var cell = tbl_row.insertCell();
	        		cell.innerHTML = this['name'].toString().substring(0,30) + (this['name'].toString().length >= 30 ? '... ' : '');
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = '<a href="' + this['url'].toString() + '">' + (this['url'].toString().indexOf('kickstarter') != -1 ? '<img src="/image/kickstarter.png" >' : '<img src="/image/indiegogo.png" >') + '</a>';
	        		
	        		cell = tbl_row.insertCell();
	        		if(Object.prototype.toString.call(this['category']) !== '[object Array]')
	        			cell.innerHTML = this['category'].toString();
	        		else if(this['category'].length < 4)
	        			cell.innerHTML = this['category'].join(', ').toString();
	        		else if(this['category'].length < 30)
	        			cell.innerHTML = (this['category'].join(', ').toString().substring(0,36) + '... ');
	        		else
	        			cell.innerHTML = '';

	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['location'].toString().substring(0,36) + (this['location'].toString().length >= 36? '... ' : '');
	        				        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = this['backed'].toString();
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = '<a href="' + this['facebook'].toString() + '">' + (this['facebook'].toString().indexOf('facebook') != -1 ? '<img src="/image/facebook.png" >' : '') + '</a>';
	        		
	        		cell = tbl_row.insertCell();
	        		cell.innerHTML = '<a href="' + this['twitter'].toString() + '">' + (this['twitter'].toString().indexOf('twitter') != -1 ? '<img src="/image/twitter.png" >' : '') + '</a>';
	    	 	odd_even = !odd_even;               
		    	})
		    	$("#backers_table").empty().append(tbl_thead).append(tbl_body);

				if($.fn.dataTable.isDataTable('#backers_table'))
					table.destroy();
					
			    table = $('#backers_table').DataTable( {
			        "ordering": false,
			        "pageLength": 25,
			        "lengthChange": false,
			        bFilter: false
			    } );
			}
		},
		error : function(e){
			bv.showBackersError('Search Failure', 'Please check search inputs');
		}
	}); 
	$('#name-tf').focus();
})