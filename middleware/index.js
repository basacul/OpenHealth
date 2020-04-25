const User = require('../models/user');

const middleware = {};

/**
 * middleware for authoritisation and authentication
 */
middleware.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error', 'Please, Login First');
        res.redirect('/');
    }
};

/**
 * middleware that checks if the user verified the associated account
 */
middleware.isVerified = function(req, res, next){
	User.findOne({username: req.body.username}, function(err,user){
		if(err){
			req.flash('error', err.message);
			res.redirect('back');
		}else{
			if(user && !user.active){
				req.flash('error', 'Please verify your account before accessing Mana.');
				res.redirect('/verification');
			}else{
				next();	

			}
			
		}
	});
};


module.exports = middleware;