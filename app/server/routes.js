var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');

module.exports = function(app) {

// main page //
	app.get('/', function(req, res) {
		//res.render('index');
		res.redirect('/login');
	});
	
	
// login page //
	app.get('/login', function(req, res){
	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Login To BackersLab' });
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				    req.session.user = o;
					res.redirect('/dashboard');
				}	else{
					res.render('login', { title: 'Login To BackersLab' });
				}
			});
		}
	});
	
	app.post('/login', function(req, res){
		AM.manualLogin(req.body['user'], req.body['pass'], function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				req.session.user = o;
				res.cookie('user', o.user, { maxAge: 900000 });
				res.cookie('pass', o.pass, { maxAge: 900000 });
				res.redirect('/dashboard');
			}
		});
	});


// logged-in user homepage //
	
	app.get('/dashboard', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('dashboard', {
				title : 'Dashboard',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/dashboard', function(req, res){
		if (req.body['user'] != undefined) {
			AM.updateAccount({
				user 	: req.body['user'],
				name 	: req.body['name'],
				email 	: req.body['email'],
				country : req.body['country']
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.status(200).send('ok');
				}
			});
		}	else if (req.body['logout'] == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.status(200).send('ok'); });
		}
	});
	

// admin panel
	app.get('/admin', function(req, res) {
		if (req.session.user != null && req.session.user['status'] == 'Admin') {
			res.render('admin', {
				title : 'Admin',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	
// admin panel get users
	app.post('/admin', function(req, res) {
		if(req.session.user != null && req.session.user['status'] == 'Admin') {
			if(req.body['type'] == 'search')
				AM.returnAllAccounts( { user:req.body['user'], name:req.body['name'], email:req.body['email'], country:req.body['country'] }, function(e, o){
				if (!o){
					res.status(400).send(e);
				}	else{
					res.send(o);
				}
			});
			else if(req.body['type'] == 'update') {
				AM.adminUpdateAccount({
					user 	: req.body['user'],
					name 	: req.body['name'],
					email 	: req.body['email'],
					credits : req.body['credits'],
					pass	: req.body['pass'],
					country : req.body['country'],
					status 	: req.body['status']
				}, function(e, o){
					if (e)
						res.status(400).send('error-updating-account');
					else
						res.status(200).send('ok');
				});
			}
		}
	});


	
// logged-in user settings page //
	
	app.get('/settings', function(req, res) {
		if (req.session.user == null){
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('settings', {
				title : 'Settings',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/settings', function(req, res){
		if (req.body['user'] != undefined) {
			AM.updateAccount({
				user 	: req.body['user'],
				name 	: req.body['name'],
				email 	: req.body['email'],
				pass	: req.body['pass'],
				country : req.body['country']
			}, function(e, o){
				if (e){
					res.status(400).send('error-updating-account');
				}	else{
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.status(200).send('ok');
				}
			});
		}	else if (req.body['logout'] == 'true'){
			res.clearCookie('user');
			res.clearCookie('pass');
			req.session.destroy(function(e){ res.status(200).send('ok'); });
		}
	});


	// credits page
	app.get('/credits', function(req, res) {
		if (req.session.user == null){
			res.redirect('/');
		}	else {
			AM.creditsCount(req.session.user, function(e, o){
				if(e)
					req.session.user.credits = 'Error getting credits\n' + e;
				else
					req.session.user.credits = o;
				res.render('credits', {
					title : 'Credits',
					udata : req.session.user
				});
			})
		}
	});
	
	
// logout
	app.get('/logout', function(req, res) {
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy();
		res.redirect('/');
	});

	
// logged-in user backer search //
	
	app.get('/backers', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('backers', {
				title : 'Backers Search',
				udata : req.session.user
			});
		}
	});
	
	app.post('/backers', function(req, res) {
		AM.returnAllBackers( { platform:req.body.platform[0], category:req.body.category[0], location:req.body['location'], backed:req.body['backed'], limit:(req.session.user['status'] == 'Admin' || req.session.user['status'] == 'Active' ? 1000 : 5)}, function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});

	
// save backers 
	app.post('/savebackers', function(req, res) {
		AM.saveBackers(req.body, function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});
	
	
	// save backers 
	app.post('/backersCount', function(req, res) {
		AM.backersCount(function(e, o){
			if (e){
				console.log('e ' + e + '\t' + o);
				res.sendStatus(e);
			}	else{
				res.send(o);
			}
		})
	});
	

// save journalists
	app.post('/savejournalists', function(req, res) {
		AM.saveJournalists(req.body, function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});
	

// logged-in user journalists search //
	app.get('/deletejournalists', function(req, res) {
		AM.deleteJournalists(function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});
	
	app.get('/journalists', function(req, res) {
		if (req.session.user == null) {
		// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('journalists', {
				title : 'Journalists Search',
				udata : req.session.user
			});
		}
	});
	
	app.post('/journalists', function(req, res) {
		AM.returnAllJournalists( { keyword:req.body.keyword}, function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});

	
	// contact journalists
	app.get('/contact-journalists', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			if(req.query.id != null) {
				AM.revealJournalist({ user:req.session.user._id, journalist:req.query.id }, function(e, o){
					if (!o){
						if(e == '0 credits')
							res.redirect('/credits');
					}	else{
						res.render('contact-journalists', {
							title : 'Contact Journalists',
							udata : req.session.user
						});
					}
				})
			}
			else {
				res.render('contact-journalists', {
					title : 'Contact Journalists',
					udata : req.session.user
				});
			}
		}
	});

	app.post('/contact-journalists', function(req, res) {
		if (req.session.user == null) {
		// if user is not logged-in redirect back to login page //
				res.redirect('/');
			}	else{
				AM.returnAllContactJournalists({ user:req.session.user._id, name:req.body['name'] }, function(e, o){
					if (!o){
						res.status(400).send(e);
					}	else{
						res.send(o);
					}
				})
			}
	});
	
	
	
// save outlets
	app.post('/saveoutlets', function(req, res) {
		AM.saveOutlets(req.body, function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});
	
	
	
// logged-in user outlets search //
	app.get('/deleteoutlets', function(req, res) {
		AM.deleteOutlets(function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});
	
	app.get('/outlets', function(req, res) {
		if (req.session.user == null) {
		// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('outlets', {
				title : 'Outlets Search',
				udata : req.session.user
			});
		}
	});
	
	app.post('/outlets', function(req, res) {
		AM.returnAllOutlets( { keyword:req.body.keyword}, function(e, o){
			if (!o){
				res.status(400).send(e);
			}	else{
				res.send(o);
			}
		})
	});

	
	// contact outlets
	app.get('/contact-outlets', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			if(req.query.id != null) {
				AM.revealOutlet({ user:req.session.user._id, outlet:req.query.id }, function(e, o){
					if (!o){
						if(e == '0 credits')
							res.redirect('/credits');
					}	else{
						res.render('contact-outlets', {
							title : 'Contact Outlets',
							udata : req.session.user
						});
					}
				})
			}
			else {
				res.render('contact-outlets', {
					title : 'Contact Outlets',
					udata : req.session.user
				});
			}
		}
	});

	app.post('/contact-outlets', function(req, res) {
		if (req.session.user == null) {
		// if user is not logged-in redirect back to login page //
				res.redirect('/');
			}	else{
				AM.returnAllContactOutlets({ user:req.session.user._id, name:req.body['name'] }, function(e, o){
					if (!o){
						res.status(400).send(e);
					}	else{
						res.send(o);
					}
				})
			}
	});
	
	
	
// prediction 
	app.get('/prediction', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('prediction', {
				title : 'Campaign Success Prediction',
				udata : req.session.user
			});
		}
	});
	
	
	
// facebook 
	app.get('/facebook', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('facebook', {
				title : 'Schedule Facebook',
				udata : req.session.user
			});
		}
	});
	
	
// contact 
	app.get('/contact', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('contact', {
				title : 'Contact Us',
				udata : req.session.user
			});
		}
	});
	
	
	
	// privacy 
	app.get('/privacy', function(req, res) {
		if (req.session.user == null) {
	// if user is not logged-in redirect back to login page //
			res.redirect('/');
		}	else{
			res.render('privacy', {
				title : 'Privacy Policy',
				udata : req.session.user
			});
		}
	});

	
	
// creating new accounts //
	
	app.get('/signup', function(req, res) {
		res.render('signup', {  title: 'Register', countries : CT });
	});
	
	app.post('/signup', function(req, res) {
		AM.addNewAccount({
			name 	: req.body['name'],
			email 	: req.body['email'],
			user 	: req.body['user'],
			pass	: req.body['pass'],
			country : req.body['country'],
			status 	: (req.body['user'] == 'admin' ? 'Admin' : 'Inactive')
		}, function(e){
			if (e){
				res.status(400).send(e);
			}	else{
				res.status(200).send('ok');
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.body['email'], function(o){
			if (o){
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// TODO add an ajax loader to give user feedback //
					if (!e){
						res.status(200).send('ok');
					}	else{
						for (k in e) console.log('ERROR : ', k, e[k]);
						res.status(400).send('unable to dispatch password reset');
					}
				});
			}	else{
				res.status(400).send('email-not-found');
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.body['pass'];
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(e, o){
			if (o){
				res.status(200).send('ok');
			}	else{
				res.status(400).send('unable to update password');
			}
		})
	});
	
// view & delete accounts //
	
	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print', { title : 'Account List', accts : accounts });
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e && req.session.user['status'] != 'Admin'){
				res.clearCookie('user');
				res.clearCookie('pass');
				req.session.destroy(function(e){ res.status(200).send('ok'); });
			} else if(req.session.user['status'] == 'Admin')
				res.status(200).send('ok');
			else
				res.status(400).send('record not found');
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};