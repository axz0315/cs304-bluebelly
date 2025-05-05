// start app with 'npm run dev' in a terminal window
// go to http://localhost:port/ to view your deployment!
// every time you change something in server.js and save, your deployment will automatically reload

// to exit, type 'ctrl + c', then press the enter key in a terminal window
// if you're prompted with 'terminate batch job (y/n)?', type 'y', then press the enter key in the same terminal

// standard modules, loaded from node_modules
const path = require('path');
require("dotenv").config({ path: path.join(process.env.HOME, '.cs304env')});
const express = require('express');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const flash = require('express-flash');
const multer = require('multer');

// our modules loaded from cwd

const { Connection } = require('./connection');
const cs304 = require('./cs304');

// Create and configure the app

const app = express();

// Morgan reports the final status code of a request's response
app.use(morgan('tiny'));

app.use(cs304.logStartRequest);

// This handles POST data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cs304.logRequestData);  // tell the user about any request data
app.use(flash());


app.use(serveStatic('public'));
app.set('view engine', 'ejs');

const mongoUri = cs304.getMongoUri();

app.use(cookieSession({
    name: 'session',
    keys: ['horsebattery'],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

// ================================================================
// custom routes here

const DB = process.env.USER;

// main page. This shows the use of session cookies
app.get('/', (req, res) => {
    // let uid = req.session.uid || 'unknown';
    // let visits = req.session.visits || 0;
    // visits++;
    // req.session.visits = visits;
    // console.log('uid', uid);
    // return res.render('homepage.html', {uid, visits});
    return res.render('homepage.ejs');
});
// app.get('/', (req, res) => {
//     let uid = req.session.uid || 'unknown';
//     let visits = req.session.visits || 0;
//     visits++;
//     req.session.visits = visits;
//     console.log('uid', uid);
//     return res.render('index.ejs', {uid, visits});
// });

// shows how logins might work by setting a value in the session
// // This is a conventional, non-Ajax, login, so it redirects to main page
// app.post('/set-uid/', (req, res) => {
//     console.log('in set-uid');
//     req.session.uid = req.body.uid;
//     req.session.logged_in = true;
//     res.redirect('/');
// });

// // shows how logins might work via Ajax
// app.post('/set-uid-ajax/', (req, res) => {
//     console.log(Object.keys(req.body));
//     console.log(req.body);
//     let uid = req.body.uid;
//     if(!uid) {
//         res.send({error: 'no uid'}, 400);
//         return;
//     }
//     req.session.uid = req.body.uid;
//     req.session.logged_in = true;
//     console.log('logged in via ajax as ', req.body.uid);
//     res.send({error: false});
// });

// // conventional non-Ajax logout, so redirects
// app.post('/logout/', (req, res) => {
//     console.log('in logout');
//     req.session.uid = false;
//     req.session.logged_in = false;
//     res.redirect('/');
// });


app.post('/review/', async (req, res) => { //??: how to link username/user ID to the review?
    //create review and insert it into the database collection
    let review = {restaurant: req.body.restaurant, //to-do: user field using cookies
                address: req.body.addr,
                rating: req.body.rating,
                text: req.body.review};
    const db = await Connection.open(mongoUri, "BlueBelly");
    await db.collection("reviews").insertOne(review);

    //render the main feed (can be homepage for now)
    return res.redirect("/main-feed/");
});

app.get('/main-feed/', async (req, res) => {
    const db = await Connection.open(mongoUri, "BlueBelly");
    let reviewsArray = await db.collection("reviews").find().toArray();
    return res.render('feed.ejs', {reviews: reviewsArray, search: 0});
});

//search
app.get('/search/', async (req, res) => {
    let field = req.query.field;
    let name = req.query.name;
    let query = new RegExp(req.query.name, "i");
    let fieldname;
    let reviewsArray;
    const db = await Connection.open(mongoUri, "BlueBelly");

    if ((field == 0) || (field == 1)) { //if user does not choose a field, default to restaurant
        fieldname = "restaurant";
        reviewsArray = await db.collection("reviews").find({restaurant: {$regex: query}}).toArray();
    } else if (field == 2) {
        fieldname = "user";
        reviewsArray = await db.collection("reviews").find({user: {$regex: query}}).toArray(); //to-do: implement once sessions are done
    };
    console.log(reviewsArray);
    return res.render('feed.ejs', {reviews: reviewsArray, name: name, field: fieldname, search: 1});
});

// ------------------------------------------------------------

app.get("/user/:uid", async (req, res) => {//to-do
    let user = new RegExp(req.params.uid);
    const db = await Connection.open(mongoUri, "BlueBelly");
    let reviewsArray = await db.collection("reviews").find({user: {$regex: user}}).toArray();
    res.render("user.ejs", {user: user, reviews: reviewsArray});
});

app.post('/review/delete/:restaurant/:user', async (req, res) => { //??: how to link username/user ID to the review?
    //to-do
    //flash message "are you sure you want to delete this review"
    //if they click yes, then remove the review from the collection
    const db = await Connection.open(mongoUri, "BlueBelly");
    let restaurant = new RegExp(req.params.restaurant);
    let user = new RegExp(req.params.user);
    await db.collection("reviews").deleteOne({restaurant: {$regexp: restaurant}}, {user: {$regexp: user}});

    //redirect to the user's profile
    return res.redirect("/user/:uid");
});


// people form code
let userData = {};

// page for new users
app.get("/new-user", (req, res) => {
    res.render("newUser");
});

// submitting the information in the form
app.post("/submit-user", (req, res) => {
    userData = {
        name: req.body.name,
        username: req.body.username,
        email: req.body.email
    };

    // redirect to the profile page after the user makes a new profile
    res.redirect("/profile");
});


// profile page of the user
app.get("/profile", (req, res) => {
    res.render("profile", { user: userData });
});
// // ------------------------------------------------------------
//restaurant routes

//restaurant profile
// app.get("/restaurant/:ID", async (req, res) => {
//     const rid = req.params.ID;
//     const db = await Connection.open(mongoUri, "BlueBelly");
//     var restaurant = db.collection("restaurants").find({rid: rid}).toArray();
//     restaurant = restaurant[0];
//     const reviews = db.collection("reviews").find({rid: rid}).toArray();
//     var price = restaurant.price * "$";
//     res.render("restaurant.ejs", {restaurant, price, reviews});
// });

// ================================================================
// postlude

const serverPort = cs304.getPort(8080);

// this is last, because it never returns
app.listen(serverPort, function() {
    console.log(`open http://localhost:${serverPort}`);
});
