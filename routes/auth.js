const express = require('express');
const router = express.Router(); // now instead of app, use router
const passport = require('passport');
const cryptoRandomString = require('crypto-random-string'); // to generate verification token
const User = require('../models/user');
const middleware = require('../middleware');

// to create the necessary folder structures
const fs = require('fs');
const dir = 'encrypted/users';

router.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        res.redirect("home");
    } else {
        res.render('login');
    }
});

// perform simple promise procedure to test for inactivity
router.post("/login", middleware.isVerified, passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/',
    failureFlash: true,
    successFlash: `Welcome back!`
}), function (req, res) {
	// we can change the strategy 'local' to 'twitter' or something else. THis redirects user
	// indirectly to /home as authenticated
	// passport.authenticate('local')(req, res, function () {
	//     res.redirect('/');
	// });
});

router.get('/register', function (req, res) {
    if (!req.isAuthenticated()) {
        res.render('register');
    } else {
        req.flash('error', 'Sign up only accessible if not logged in.');
        res.redirect('/home');
    }
});
/**
 * Handles user sign up
 */
router.post('/register', function (req, res) {
	// check, that a username and email is not already taken
    User.register(new User({ username: req.body.username, email: req.body.email, active: false }), req.body.password, function (err, user) {
        if (err) {
            console.log('Error on sign up', err);
            req.flash('error', err.message);
            res.redirect('/register');
        } else {
			
            fs.mkdir(`${dir}/${req.body.username}`, { recursive: true }, (err) => {
                if (err) {
                    req.flash('error', err.message);
                    throw err;
                }
            });

			
			// TODO: generate secret token and send email
			user.token = cryptoRandomString({length: 32, type: 'base64'});
			user.save();

            req.flash('success', 'Please check your email and follow the instructions to input verification token.');
            res.redirect('/verification');
        }
    });
});

// allows user to verify with a secret token
router.get('/verification', (req,res) => {
	if (req.isAuthenticated()) {
        res.redirect("home");
    } else {
        res.render('verification');
    }
});

// to process the secret token and activate the user
router.post('/verification', (req, res) => {

	User.findOne({token: req.body.token}, function(err, user){
		if(!user){
			
			req.flash('error', 'Please make sure your token is correct.');
			res.redirect('/verification');
			
		}else{
			
			if(user.active){
				
				req.flash('success', 'Your account has already been verified. Please log in.');
				res.redirect('/');
				
			}else{

				if(user.username === req.body.username){
					user.active = true;
					user.save();
					req.flash('success', `Verification successful. You can now log in.`);
					res.redirect('/');
				}else{
					req.flash('error', 'Please make sure your username is correct.');
					res.redirect('/verification');
				}
				
			}
			
		}
	});
});

router.get('/logout', middleware.isLoggedIn, function (req, res) {
    req.logout();
    req.flash('success', 'Successfully logged you out');
    res.redirect('/');
});


module.exports = router;