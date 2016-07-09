
var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'node-login';

/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if(e)
		console.log(e);
	else
		console.log('connected to database :: ' + dbName);
});
var accounts 	= db.collection('accounts');
var backers 	= db.collection('backers');
var journalists = db.collection('journalists');
var contacts 	= db.collection('contacts');
var outlets 	= db.collection('outlets');
var ocontacts 	= db.collection('ocontacts');

/* login validation methods */

exports.autoLogin = function(email, pass, callback)
{
	accounts.findOne({email:email}, function(e, o) {
		if(o && o.pass == pass){
			backersCount(function(n) {
				o.backersCount = n;
				journalistsCount(function(m) {
					o.journalistsCount = m;
					outletsCount(function(p) {
						o.outletsCount = p;
						callback(o);
					});
				});
			});
		}
		else
			callback(null);
	});
}

exports.manualLogin = function(email, pass, callback)
{
	accounts.findOne({email:email}, function(e, o) {
		if(o == null)
			callback('user-not-found');
		else {
			validatePassword(pass, o.pass, function(err, res) {
				if(res) {
					backersCount(function(n) {
						o.backersCount = n;
						journalistsCount(function(m) {
							o.journalistsCount = m;
							outletsCount(function(p) {
								o.outletsCount = p;
								callback(null, o);
							});
						});
					});
				}
				else
					callback('invalid-password');
			});
		}
	});
}

exports.resetPassword = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o) {
		if(o == null)
			callback('Email address is not in use', null);
		else {
			var pass = generateSalt();
			saltAndHash(pass, function(hash) {
				sendEmail('BackersLab Password Reset', 'noreply@backerslab.com', email, 'BackersLab Password Reset', 'Your new BackersLab password is:\n' + pass, function(err) {
					if(err) callback('Can\'t reset password. Please contact support', null);
					else {
						o.pass = hash;
						accounts.save(o, {safe: true}, function(err) {
							if(err) callback('Can\'t reset password. Please contact support', null);
							else callback(null, 'New password sent to your email address.\nRedirecting to login page');
						});
					}
				});
			});
		}
	});
}

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({email:newData.email}, function(e, o) {
		if(o)
			callback('email-taken');
		else {
			saltAndHash(newData.pass, function(hash){
				newData.pass 	= hash;
				newData.date 	= moment().format('MMMM Do YYYY, h:mm:ss a');
				newData.credits = 0;
				accounts.insert(newData, {safe: true}, callback);
			});
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	accounts.findOne({email:newData.email}, function(e, o) {
		if(e || !o)
			callback('Cannot edit account');
		else {
			o.name 		= newData.name;
			o.email 	= newData.email;
			o.country 	= newData.country;
			o.subject 	= newData.subject;
			o.message 	= newData.message;
			if(newData.pass == '') {
				accounts.save(o, {safe: true}, function(err) {
					if(err) callback(err);
					else callback(null, o);
				});
			} else {
				saltAndHash(newData.pass, function(hash) {
					o.pass = hash;
					accounts.save(o, {safe: true}, function(err) {
						if (err) callback(err);
						else callback(null, o);
					});
				});
			}
		}
	});
}

exports.adminUpdateAccount = function(newData, callback)
{
	accounts.findOne({_id:require('mongodb').ObjectID(newData.userid)}, function(e, o) {
		if(e || !o)
			callback('Cannot find account');
		else {
			o.name 		= newData.name;
			o.email 	= newData.email;
			o.credits 	= (parseInt(newData.credits) ? parseInt(newData.credits) : 0);
			o.country 	= newData.country;
			o.status 	= newData.status;
			o.subject 	= newData.subject;
			o.message 	= newData.message;
			if(newData.pass == '') {
				accounts.save(o, {safe: true}, function(err) {
					if(err) callback(err);
					else callback(null, o);
				});
			} else {
				saltAndHash(newData.pass, function(hash) {
					o.pass = hash;
					accounts.save(o, {safe: true}, function(err) {
						if(err) callback(err);
						else callback(null, o);
					});
				});
			}
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		if (e){
			callback(e, null);
		}	else{
			saltAndHash(newPass, function(hash){
		        o.pass = hash;
		        accounts.save(o, {safe: true}, callback);
			});
		}
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	accounts.remove({_id: getObjectId(id)}, callback);
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

exports.returnAllAccounts = function(q, callback)
{
	accounts.find( { name:{'$regex':q.name}, email:{'$regex':q.email}, country:{'$regex':q.country} } ).limit(1250).toArray(function(e, o) {
	    if(e)
	      callback(e, null);
	    else {
	      callback(null, o);
	    }
    });
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return new require('mongodb').ObjectID(id);
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}



/* type check */
function isType(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}



/* backers database methods */


exports.returnAllBackers = function(q, callback)
{
	backers.find( { url:{'$regex':q.platform}, category:{'$regex':q.category}, location:{'$regex':q.location}, backed:{$gt:(q.backed == '' ? 0 : parseInt(q.backed))} }, { _id: 0 } ).limit(q.limit).sort( { $natural: -1 } ).toArray(function(e, o) {
	    if(e)
	      callback(e, null);
	    else
	      callback(null, o);
    });
}


exports.saveBackers = function(bs, callback)
{
	if(isType('Array', bs) && bs.length > 0 && isType('Object', bs[0])) {
		var total 		= 0;
		var nMatched 	= 0;
		var nUpserted 	= 0;
		var nModified 	= 0;
		bs.forEach(function(b) {
			backers.find({ url: b.url }).toArray(function(e, o) {
			    if(e)
			      callback(e, null);
			    else {
			    	if(o.length > 0) {
			    		if(o[0].category.indexOf(b.category[0]) == -1)
				    		o[0].category.push(b.category[0]);
				    	b.category = o[0].category;
			    	}

				    backers.update({ url: b.url }, b, { upsert: true }, function (e, result) {
						total++;
						if(e) {
							callback(e, null);
						}
						else {
							/*nMatched 	+= parseInt(result.nMatched);
							nUpserted 	+= parseInt(result.nUpserted);
							nModified 	+= parseInt(result.nModified);*/
						}
						if(total == bs.length)
							callback(null, 'Updated ' + bs.length + ' documents');
							//callback(null, 'Inserted ' + bs.length + ' documents\nnMatched' + nMatched + '\nnUpserted' + nUpserted + '\nnModified' + nModified);
					});
			    }
		    });
		});
	}
	else
		callback('Error saving', null);
}


/*exports.deleteBackers = function(callback)
{
	backers.drop(function(e, reply) {
		if(e)
			callback('Error deleting collection\n' + e);
		else
			callback('Collection deleting ' + reply);
    });
}*/


var backersCount = function(callback) {
	backers.count({}, function(e, reply) {
		if(e)
			callback(0);
		else
			callback(reply);
    });
}




/* journalists database methods */


exports.returnAllJournalists = function(q, callback)
{
	journalists.find( { $or: [ { name:{'$regex':q.keyword} }, { category:{'$regex':q.keyword} }, { desc:{'$regex':q.keyword} } ] }, { email: 0, phone: 0 } ).limit(1000).sort( { $natural: -1 } ).toArray(function(e, o) {
	    if(e)
	      callback(e, null);
	    else
	      callback(null, o);
    });
}


exports.returnAllContactJournalists = function(q, callback)
{
	contacts.find( { user:q.user, name:{'$regex':q.name} }, { _id: 0 } ).limit(10000).sort( { $natural: -1 } ).toArray(function(e, o) {
	    if(e)
	      callback(e, null);
	    else
	      callback(null, o);
    });
}


exports.saveJournalists = function(js, callback)
{
	if(isType('Array', js) && js.length > 0 && isType('Object', js[0])) {
		var total 		= 0;
		var nMatched 	= 0;
		var nUpserted 	= 0;
		var nModified 	= 0;
		js.forEach(function(j) {
			journalists.find({ name: j.name }).toArray(function(e, o) {
			    if(e)
			      callback(e, null);
			    else {
			    	if(o.length > 0) {
			    		if(o[0].category.indexOf(j.category[0]) == -1)
				    		o[0].category.push(j.category[0]);
				    	j.category = o[0].category;
			    	}

				    journalists.update({ name: j.name }, j, { upsert: true }, function (e, result) {
						total++;
						if(e) {
							callback(e, null);
						}
						else {
							/*nMatched 	+= parseInt(result.nMatched);
							nUpserted 	+= parseInt(result.nUpserted);
							nModified 	+= parseInt(result.nModified);*/
						}
						if(total == js.length)
							callback(null, 'Updated ' + js.length + ' documents');
							//callback(null, 'Inserted ' + bs.length + ' documents\nnMatched' + nMatched + '\nnUpserted' + nUpserted + '\nnModified' + nModified);
					});
			    }
		    });
		});
	}
	else
		callback('Error saving', null);
}


exports.revealJournalist = function(q, callback)
{
	contacts.find( { user:q.user, journalist:q.journalist }, { _id: 0 } ).limit(1000).toArray(function(e, o) {
	    if(e)
			callback(e, null);
	    else {
	    	if(o.length == 0) {
	    		accounts.findOne( { _id:require('mongodb').ObjectID(q.user) }, function(e, u) {
	    			if(u && u.credits != undefined) {
	    				if(parseInt(u.credits) > 0) {
		    				journalists.findOne( { _id:require('mongodb').ObjectID(q.journalist) }, function(e, v) {
				    			if(v) {
				    				v.user 		= q.user;
				    				v.journalist= q.journalist;
				    				
				    				contacts.save(v, { safe: true, upsert: true }, function(err) {
										if(err)
						    				callback(err, null);	    				
										else {
						    				accounts.update( { _id:require('mongodb').ObjectID(q.user) }, { $inc: { credits:-1} }, function(err) {
												if(err)
								    				callback(err, null);	    				
												else
								    				callback(null, o);	    				
											});
						    			}
									});
				    			}
				    			else
				    				callback(e, null);
			    			});
	    				}
	    				else
	    					callback('0 credits', null);
	    			}
	    			else
	    				callback(e, null);	    				
	    		});
	    	}
	    	else
	      		callback(null, o);
	    }
    });
}


/*exports.deleteJournalists = function(callback)
{
	journalists.update({ name: "Mike Butcher" }, {"name":"Mike Butcher","twitter":"@mikebutcher","email":"mike@techcrunch.com","phone":"","category":["TechCrunch","Technology"],"desc":"Editor-At-Large @TechCrunch | Also @TechHub @Coadec @TheEuropas @TheSomaSalon bit.ly/MBbio Facebook.com/mikebutcher Linkedin.com/in/mikebutcher"}, { upsert: true }, function (e, result) {

	});
	journalists.drop(function(e, reply) {
		if(e)
			callback('Error deleting collection\n' + e);
		else {
			journalists.update({ name: "Mike Butcher" }, {"name":"Mike Butcher","twitter":"@mikebutcher","email":"mike@techcrunch.com","phone":"","category":["TechCrunch","Technology"],"desc":"Editor-At-Large @TechCrunch | Also @TechHub @Coadec @TheEuropas @TheSomaSalon bit.ly/MBbio Facebook.com/mikebutcher Linkedin.com/in/mikebutcher"}, { upsert: true }, function (e, result) {
				if(e)
					callback('Error deleting collection\n' + e);
				else
					callback('Collection deleting ' + result);
			});
		}
    });
}*/


var journalistsCount = function(callback) {
	journalists.count({}, function(e, reply) {
		if(e)
			callback(0);
		else
			callback(reply);
    });
}



/* outlets database methods */


exports.returnAllOutlets = function(q, callback)
{
	outlets.find( { $or: [ { name:{'$regex':q.keyword} }, { category:{'$regex':q.keyword} }, { desc:{'$regex':q.keyword} } ] }, { email: 0, phone: 0 } ).limit(1000).sort( { $natural: -1 } ).toArray(function(e, o) {
	    if(e)
	      callback(e, null);
	    else
	      callback(null, o);
    });
}


exports.returnAllContactOutlets = function(q, callback)
{
	ocontacts.find( { user:q.user, name:{'$regex':q.name} }, { _id: 0 } ).limit(10000).sort( { $natural: -1 } ).toArray(function(e, o) {
	    if(e)
	      callback(e, null);
	    else
	      callback(null, o);
    });
}


exports.saveOutlets = function(js, callback)
{
	if(isType('Array', js) && js.length > 0 && isType('Object', js[0])) {
		var total 		= 0;
		var nMatched 	= 0;
		var nUpserted 	= 0;
		var nModified 	= 0;
		js.forEach(function(j) {
			outlets.find({ name: j.name }).toArray(function(e, o) {
			    if(e)
			      callback(e, null);
			    else {
			    	if(o.length > 0) {
			    		if(o[0].category.indexOf(j.category[0]) == -1)
				    		o[0].category.push(j.category[0]);
				    	j.category = o[0].category;
			    	}

				    outlets.update({ name: j.name }, j, { upsert: true }, function (e, result) {
						total++;
						if(e) {
							callback(e, null);
						}
						else {
							/*nMatched 	+= parseInt(result.nMatched);
							nUpserted 	+= parseInt(result.nUpserted);
							nModified 	+= parseInt(result.nModified);*/
						}
						if(total == js.length)
							callback(null, 'Updated ' + js.length + ' documents');
							//callback(null, 'Inserted ' + bs.length + ' documents\nnMatched' + nMatched + '\nnUpserted' + nUpserted + '\nnModified' + nModified);
					});
			    }
		    });
		});
	}
	else
		callback('Error saving', null);
}


exports.revealOutlet = function(q, callback)
{
	ocontacts.find( { user:q.user, outlet:q.outlet }, { _id: 0 } ).limit(1000).toArray(function(e, o) {
	    if(e)
			callback(e, null);
	    else {
	    	if(o.length == 0) {
	    		accounts.findOne( { _id:require('mongodb').ObjectID(q.user) }, function(e, u) {
	    			if(u && u.credits != undefined) {
	    				if(parseInt(u.credits) > 0) {
		    				outlets.findOne( { _id:require('mongodb').ObjectID(q.outlet) }, function(e, v) {
				    			if(v) {
				    				v.user 	= q.user;
				    				v.outlet= q.outlet;
				    				
				    				ocontacts.save(v, { safe: true, upsert: true }, function(err) {
										if(err)
						    				callback(err, null);	    				
										else {
						    				accounts.update( { _id:require('mongodb').ObjectID(q.user) }, { $inc: { credits:-1} }, function(err) {
												if(err)
								    				callback(err, null);	    				
												else
								    				callback(null, o);	    				
											});
						    			}
									});
				    			}
				    			else
				    				callback(e, null);
			    			});
	    				}
	    				else
	    					callback('0 credits', null);
	    			}
	    			else
	    				callback(e, null);	    				
	    		});
	    	}
	    	else
	      		callback(null, o);
	    }
    });
}


var outletsCount = function(callback) {
	outlets.count({}, function(e, reply) {
		if(e)
			callback(0);
		else
			callback(reply);
    });
}


exports.creditsCount = function(user, callback)
{
	accounts.findOne({email:user.email}, function(e, o) {
		if(!o)
			callback(e, null);
		else
			callback(null, o.credits);
	});
}

var sendEmail = function(name, replyto, email, subject, message, callback)
{
	var api_key = 'key-d86f8596f89c9aedbb7ca97abe2286e4';
	var domain	= 'backerslab.com';
	var mailgun = require('mailgun-js')({ apiKey: api_key, domain: domain });
	
	var data = {
	  to: email,
	  from: name + ' <reply@backerslab.com>',
	  'h:Reply-To': replyto,
	  subject: subject,
	  text: message + '\n\n\n_________________________\n\nSent via backerslab.com\nPlease reply directly to this email'
	};

	mailgun.messages().send(data, function(e, body) {
		if(e)
			callback(e);
		else
			callback(null);
	});
}