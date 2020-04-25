// =============================================================================================
// SETUP
// =============================================================================================
const express = require('express'),
    app = express(),
    mongoose = require('mongoose'),
    flash = require('connect-flash'),
    passport = require('passport'),
    bodyParser = require('body-parser'),
    LocalStrategy = require('passport-local'),
    methodOverride = require('method-override'),
    expressSanitizer = require('express-sanitizer'),
    User = require('./models/user'),
    // seedDatabase = require('./models/seed'), // commented otherwise it still seeds the db
    localPort = 9000,   // in case you run a localhost then on port 9000
    localDB = "mongodb://localhost:27017/mana"; // in case you run a local mongodb

app.set("view engine", "ejs");

app.use(require('express-session')({
    secret: 'Mana is a dapp',
    resave: false,
    saveUninitialized: false
}));


app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(`${__dirname}/public`));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); // this line after app.use(bodyParser.urlencoded({ extended: true }));


/**
 * These two methods are really important : 
 * Deserialize: for reading the session, taking the data from the session and 
 * decoding it
 * Serialize: encodes the data. 
 * This is possible thanks to passport-local-mongoose. Do not forget the parenthesis
 * at the end of the method authenticate, serializeUser and deserializeUser. Otherwise
 * you won't see any errors nor does the application work as intended, thus causing
 * a lot of headaches.
 */
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware that allows to inject currentUser and req.flash() to each site, especially
// in the header and footer
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});



// =============================================================================================
// DB STUFF : MongoDB needs to be running https://mongoosejs.com/
// =============================================================================================

mongoose.connect(process.env.DATABASEURL || localDB, { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });

// seedDatabase(); // resets the database with seed data

// =============================================================================================
// ROUTES
// =============================================================================================
const authRoutes = require('./routes/auth'),
	testRoutes = require('./routes/test'),
    homeRoutes = require('./routes/home'),
	emergencyRoutes = require('./routes/emergency'),
    accountRoutes = require('./routes/account');

app.use('/', authRoutes);
app.use('/home', homeRoutes);
app.use('/account', accountRoutes);
app.use('/tests', testRoutes);
app.use('/emergency', emergencyRoutes);



// DEFAULT ROUTE IF NOTHING ELSE MATCHES
app.get('*', function (req, res) {
    res.redirect('/');
});

app.listen(process.env.PORT || localPort, () => {
    console.log(`Running on https://openhealth.run.goorm.io`);
});


