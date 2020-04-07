const express = require('express');
const mongoose = require('mongoose');
const router = express.Router(); // now instead of app, use router
const middleware = require('../middleware');
const hlf = require('../utils/hyperledger');
const Mana = require('../models/mana');
const File = require('../models/file');
const User = require('../models/user');
const winston = require('../config/winston');
const aws = require('../utils/aws');
const download = require('../config/download');

/**
* Main emergency website with main information
*/
router.get('/', middleware.isLoggedIn, (req, res) => {
	res.render("app/emergency/emergency");
});

/**
* Subsite medicine related emergencies with information
*/
router.get('/medicine', middleware.isLoggedIn, (req, res) =>{
	res.render("app/emergency/medicine");
});

/**
* Subsite surgery related emergencies with information
*/
router.get('/surgery', middleware.isLoggedIn, (req, res) =>{
	res.render("app/emergency/surgery");
});

/**
* Subsite orthopedic related emergencies with information
*/
router.get('/orthopedics', middleware.isLoggedIn, (req, res) =>{
	res.render("app/emergency/orthopedics");
});

/**
* Subsite gynecology related emergencies with information
*/
router.get('/gynecology', middleware.isLoggedIn, (req, res) =>{
	res.render("app/emergency/gynecology");
});

/**
* Subsite ophthalmology related emergencies with information
*/
router.get('/ophthalmology', middleware.isLoggedIn, (req, res) =>{
	res.render("app/emergency/ophthalmology");
});

module.exports = router;