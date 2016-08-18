var CT			= require('./modules/country-list');
var AM			= require('./modules/account-manager');
var EM			= require('./modules/email-dispatcher');
var multiparty	= require('multiparty');


module.exports = function(app) {

	// main page //
	app.get('/', function(req, res) {
		res.redirect('/login');
	});
	
	
	// login page //
	app.get('/login', function(req, res) {
		if(req.cookies.email == undefined || req.cookies.pass == undefined)
			res.render('login', { title: 'Login To BackersLab' });
		else {
			AM.autoLogin(req.cookies.email, req.cookies.pass, function(o) {
				if(o != null) {
				    req.session.user = o;
					res.redirect('/dashboard');
				} else
					res.render('login', { title: 'Login To BackersLab' });
			});
		}
	});
	
	app.post('/login', function(req, res){
		AM.manualLogin(req.body['email'], req.body['pass'], function(e, o){
			if(!o)
				res.status(400).send(e);
			else {
				req.session.user = o;
				res.cookie('email', o.email, { maxAge: 900000 });
				res.cookie('pass', o.pass, { maxAge: 900000 });
				res.redirect('/dashboard');
			}
		});
	});


	// reset password page //
	app.get('/reset-password', function(req, res) {
		if(req.cookies.email == undefined || req.cookies.pass == undefined)
			res.render('reset-password', { title: 'Reset your account password' });
		else {
			AM.autoLogin(req.cookies.email, req.cookies.pass, function(o) {
				if(o!= null) {
				    req.session.user = o;
					res.redirect('/dashboard');
				} else
					res.render('reset-password', { title: 'Reset your account password' });
			});
		}
	});
	
	app.post('/reset-password', function(req, res){
		AM.resetPassword(req.body['email'], function(e, o){
			if(!o)
				res.status(400).send(e);
			else
				res.status(200).send(o);
		});
	});
	
	
	// logged-in user homepage //
	app.get('/dashboard', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			res.render('dashboard', {
				title : 'Dashboard',
				countries : CT,
				udata : req.session.user
			});
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
				AM.returnAllAccounts( { name:req.body['name'], email:req.body['email'], country:req.body['country'] }, function(e, o){
				if(!o)
					res.status(400).send(e);
				else
					res.send(o);
			});
			else if(req.body['type'] == 'update') {
				AM.adminUpdateAccount({
					userid 	: req.body['user-id'],
					name 	: req.body['name'],
					email 	: req.body['email'],
					credits : req.body['credits'],
					pass	: req.body['pass'],
					country : req.body['country'],
					status 	: req.body['status'],
					subject : req.body['subject'],
					message : req.body['message']
				}, function(e, o){
					if(e)
						res.status(400).send('error-updating-account');
					else
						res.status(200).send('ok');
				});
			}
		}
	});


	
	// logged-in user settings page //
	app.get('/settings', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			res.render('settings', {
				title : 'Settings',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/settings', function(req, res) {
		if(req.body['email'] != undefined && req.body['email'] == req.session.user.email && req.body['subject'].length < 128 && req.body['message'].length < 1024) {
			AM.updateAccount({
				name 	: req.body['name'],
				email 	: req.body['email'],
				pass	: req.body['pass'],
				country : req.body['country']
			}, function(e, o) {
				if(e)
					res.status(400).send('error-updating-account');
				else {
					req.session.user = o;
					if(req.cookies.email != undefined && req.cookies.pass != undefined) {
						res.cookie('email', o.email, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.status(200).send('ok');
				}
			});
		} else if(req.body['logout'] == 'true') {
			res.clearCookie('email');
			res.clearCookie('pass');
			req.session.destroy(function(e) { res.status(200).send('ok'); });
		}
		else
			res.status(400).send('error-updating-account');
	});


	// credits page
	app.get('/credits', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
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
		res.clearCookie('email');
		res.clearCookie('pass');
		req.session.destroy();
		res.redirect('/');
	});

	
	// logged-in user backer search //
	app.get('/backers', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			res.render('backers', {
				title : 'Backers Search',
				udata : req.session.user
			});
		}
	});
	
	app.post('/backers', function(req, res) {
		AM.returnAllBackers( { platform:req.body.platform[0], category:req.body.category[0], location:req.body['location'], backed:req.body['backed'], limit:(req.session.user['status'] == 'Admin' || req.session.user['status'] == 'Active' ? 1000 : 5)}, function(e, o){
			if(!o)
				res.status(400).send(e);
			else
				res.send(o);
		})
	});

	
	// save backers 
	app.post('/savebackers', function(req, res) {
		AM.saveBackers(req.body, function(e, o){
			if(!o)
				res.status(400).send(e);
			else
				res.send(o);
		})
	});
	
	
	app.post('/backersCount', function(req, res) {
		AM.backersCount(function(e, o){
			if(e)
				res.sendStatus(e);
			else
				res.send(o);
		})
	});
	

	// save journalists
	app.post('/savejournalists', function(req, res) {
		AM.saveJournalists(req.body, function(e, o){
			if(!o)
				res.status(400).send(e);
			else
				res.send(o);
		})
	});
	
	app.get('/journalists', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			res.render('journalists', {
				title : 'Journalists Search',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/journalists', function(req, res) {
		AM.returnAllPressProfiles( { type:'journalists', keyword:req.body.keyword, country:req.body.country }, function(e, o) {
			if(!o)
				res.status(400).send(e);
			else
				res.send(o);
		})
	});

	
	// contact journalists
	app.get('/contact-journalists', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			if(req.query.id != null) {
				AM.revealJournalist({ user:req.session.user._id, details:req.session.user, journalist:req.query.id }, function(e, o){
					if(!o) {
						if(e == '0 credits')
							res.redirect('/credits');
					} else {
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
		if(req.session.user == null)
				res.redirect('/');
		else {
			if(req.body['type'] == 'search')
				AM.returnAllPressContacts({ type:'journalists', user:req.session.user._id, name:req.body['name'] }, function(e, o) {
					if(!o)
						res.status(400).send(e);
					else
						res.send(o);
				})
			else {
				var form = new multiparty.Form({ uploadDir: __dirname + '/tmp', maxFilesSize: 10485760 });
				form.parse(req, function(e, fields, files) {
					if(e)
						res.status(400).send(e);
					else {
						AM.emailContact({ session:req.session.user,user:req.session.user.name, email:req.session.user.email, to:fields.to[0], subject:fields.subject[0], message:fields.message[0], bcc:(fields.bcc == undefined ? 'no' : 'yes'), attachment:(files.attachment == undefined ? '' : files.attachment[0].path) }, function(e, o) {
							if(e)
								res.status(400).send(e);
							else {
								req.session.user = o;
								res.status(200).send('Success');
							}
						});
					}
			    });
			}
		}
	});
	
	
	// save outlets
	app.post('/saveoutlets', function(req, res) {
		AM.saveOutlets(req.body, function(e, o){
			if(!o)
				res.status(400).send(e);
			else
				res.send(o);
		})
	});
	
	app.get('/outlets', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			res.render('journalists', {
				title : 'Outlets Search',
				countries : CT,
				udata : req.session.user
			});
		}
	});
	
	app.post('/outlets', function(req, res) {
		AM.returnAllPressProfiles( { type:'outlets', keyword:req.body.keyword, country:req.body.country }, function(e, o){
			if(!o)
				res.status(400).send(e);
			else
				res.send(o);
		})
	});

	
	// contact outlets
	app.get('/contact-outlets', function(req, res) {
		if (req.session.user == null)
			res.redirect('/');
		else {
			if(req.query.id != null) {
				AM.revealOutlet({ user:req.session.user._id, details:req.session.user, outlet:req.query.id }, function(e, o) {
					if(!o) {
						if(e == '0 credits')
							res.redirect('/credits');
					} else {
						res.render('contact-journalists', {
							title : 'Contact Outlets',
							udata : req.session.user
						});
					}
				})
			}
			else {
				res.render('contact-journalists', {
					title : 'Contact Outlets',
					udata : req.session.user
				});
			}
		}
	});

	app.post('/contact-outlets', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			if(req.body['type'] == 'search')
				AM.returnAllPressContacts({ type:'outlets', user:req.session.user._id, name:req.body['name'] }, function(e, o) {
					if(!o)
						res.status(400).send(e);
					else
						res.status(200).send(o);
				})
			else {
				var form = new multiparty.Form({ uploadDir: __dirname + '/tmp', maxFilesSize: 10485760 });
				form.parse(req, function(e, fields, files) {
					if(e)
						res.status(400).send(e);
					else {
						AM.emailContact({ session:req.session.user,user:req.session.user.name, email:req.session.user.email, to:fields.to[0], subject:fields.subject[0], message:fields.message[0], bcc:(fields.bcc == undefined ? 'no' : 'yes'), attachment:(files.attachment == undefined ? '' : files.attachment[0].path) }, function(e, o) {
							if(e)
								res.status(400).send(e);
							else {
								req.session.user = o;
								res.status(200).send('Success');
							}
						});
					}
			    });
			}
		}
	});
	
	
	// contact 
	app.get('/contact', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
			res.render('contact', {
				title : 'Contact Us',
				udata : req.session.user
			});
		}
	});
	
	
	
	// privacy 
	app.get('/privacy', function(req, res) {
		if(req.session.user == null)
			res.redirect('/');
		else {
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
			pass	: req.body['pass'],
			country : req.body['country'],
			subject : '',
			message : '',
			status 	: (req.body['email'] == 'admin@backerslab.com' ? 'Admin' : 'Inactive')
		}, function(e){
			if(e)
				res.status(400).send(e);
			else
				res.status(200).send('ok');
		});
	});

	
	// view & delete accounts //
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if(!e && req.session.user['status'] != 'Admin'){
				res.clearCookie('email');
				res.clearCookie('pass');
				req.session.destroy(function(e) { res.status(200).send('ok'); });
			} else if(req.session.user['status'] == 'Admin')
				res.status(200).send('ok');
			else
				res.status(400).send('record not found');
	    });
	});
	
	app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });
};