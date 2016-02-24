
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
	if (e) {
		console.log(e);
	}	else{
		console.log('connected to database :: ' + dbName);
	}
});
var accounts 	= db.collection('accounts');
var backers 	= db.collection('backers');

/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o && o.pass == pass){
			backersCount(function(n) {
				o.backersCount = n;
				callback(o);
			});
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					backersCount(function(n) {
						o.backersCount = n;
						callback(null, o);
					});
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');
						accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(err) {
				if (err) callback(err);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			});
		}
	});
}

exports.adminUpdateAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		o.status 	= newData.status;
		if (newData.pass == ''){
			accounts.save(o, {safe: true}, function(err) {
				if (err) callback(err);
				else callback(null, o);
			});
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				accounts.save(o, {safe: true}, function(err) {
					if (err) callback(err);
					else callback(null, o);
				});
			});
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
	accounts.find( { user:{'$regex':q.user}, name:{'$regex':q.name}, email:{'$regex':q.email}, country:{'$regex':q.country} } ).limit(1250).toArray(function(e, o) {
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
	backers.find( { url:{'$regex':q.platform}, category:{'$regex':q.category}, location:{'$regex':q.location}, backed:{$gt:(q.backed == '' ? 0 : parseInt(q.backed))} }, { _id: 0 } ).limit(q.limit).toArray(function(e, o) {
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


exports.deleteBackers = function(callback)
{
	backers.drop(function(e, reply) {
		if(e)
			callback('Error deleting collection\n' + e);
		else
			callback('Collection deleting ' + reply);
    });
}


var backersCount = function(callback) {
	backers.count({}, function(e, reply) {
		if(e)
			callback(0);
		else
			callback(reply);
    });
}