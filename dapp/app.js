
// ==========
// SETUP
// ==========
let express = require('express');
let bodyParser = require('body-parser');

let app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

// ==========
// DB STUFF
// ==========

// ==========
// ROUTES
// ==========
app.get("/", function (req, res) {
    let attention = "";
    if (req && req.params.attention) {
        attention = req.params.attention;
    }
    res.render("login");
});


app.post("/login", function (req, res) {
    let user = req.body.user;
    let password = req.body.password;

    // TODO: Implement authentication service
    if (authenticated(user, password)) {
        res.redirect("/home")
    } else {
        res.redirect("/")
    }
});

app.post("/:template", function (req, res) {
    let template = `/${req.params.template}`;
    res.redirect(template)
})

app.get("/:template", function (req, res) {
    let template = req.params.template;
    templat = template === "login" ? "home" : template;
    let path = `partials/${template}`;

    res.render("home", {
        path: path,
        title: template.toUpperCase()
    });
});

app.get("/checkout", function (req, res) {
    res.render("login");
})

app.listen(3000, function () {
    console.log("Running at https://localhost:3000");
});

function authenticated(user, password) {
    return user === "user" && password === "pass";
}