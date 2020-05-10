const express = require('express');
const router = express.Router(); // now instead of app, use router
const middleware = require('../middleware');
const corona = require('../utils/corona');

router.get("/", middleware.isLoggedIn, function (req, res) {
	
	corona.getData();
	
    res.render("app/home/home");
});

module.exports = router;