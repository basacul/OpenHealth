const express = require('express');
const router = express.Router(); // now instead of app, use router
const middleware = require('../middleware');
const corona = require('../utils/corona');

router.get("/", middleware.isLoggedIn, function (req, res) {
	
	// currently paused as of July 18 2020
	// corona.getData();
	
    res.render("app/home/home");
});

module.exports = router;