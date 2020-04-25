const express = require('express');
const router = express.Router(); // now instead of app, use router
const middleware = require('../middleware');
const User = require('../models/user');
const Exam = require('../models/exam');
const Test = require('../models/test');
const mailer = require('../utils/mailer');
const template = require('../utils/templates');

// email_for_dev should be replaced with user.email, but with MailGun I can only send mails to myself, yet
const email_for_dev = 'antelo.b.lucas@gmail.com';


router.get("/", middleware.isLoggedIn, function (req, res) {

	res.render("app/account/account");
	
});

router.put("/password", middleware.isLoggedIn, (req, res)=> {
	
	User.findById(req.user._id, function(err, user){
		if(err){
			req.flash('error', 'Something went wrong. Try again later.');
			res.redirect('back');
		} else if(!user){
			req.flash('error', 'Your account not found.');
			res.redirect('back');
		}else{
			if(req.body.passwordNew === req.body.passwordConfirmation){
				user.changePassword(req.body.passwordCurrent, req.body.passwordNew, function(err) {
					
					if(err) {
						
						if(err.name === 'IncorrectPasswordError'){
							
							req.flash('error', 'Incorrect password' ); // Return error
							
						}else {
							
							req.flash('error', 'Please try again after sometimes.');

						}
					} else {
						req.flash('success','Your password has been updated.' );
					}
					
					res.redirect('back');
					
				});
			}else{
				
				req.flash('error', 'Confirmation password mismatch.');
				res.redirect('back');
				
			}
			
			
		}
	});	
});



router.post('/token', middleware.isLoggedIn, (req, res) => {

	const html = template.token(req.user.username, req.user.email, req.user.token);

	// mailer.sendEmail('donotreply@openhealth.care', req.user.email, 'Your current token', html);
	mailer.sendEmail('donotreply@openhealth.care', email_for_dev , 'Your current token', html).then(info => {
		console.log('Token request from auth.js by a user.');
	}).catch(error => {
		console.log(error.message);
		req.flash('error', 'Email could not be sent.');
	});
	
	req.flash('success', `Token sent to ${req.user.email}`);
	res.redirect('back');	
	
});

router.delete('/delete', middleware.isLoggedIn,  (req,res) => {
	
	User.findOneAndRemove({token: req.body.token}, (err, user) => {
		if (err) {
			req.flash('error', 'Something went wrong with account.');
			res.redirect('back');
		}else{
			if(!user){
				req.flash('error', 'Please provide the correct token.');
				res.redirect('back');
			}else{
				// TODO: REMOVE EXAMS AND TESTS OF THE USER
				user.exams.forEach(function(exam){
					console.log(exam);
				});
				
				req.flash('success', 'Your account and exams were deleted.');
				req.logout();
				res.redirect('/');
			}
		} 
	});
});


module.exports = router;