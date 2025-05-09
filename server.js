"use strict";

// start app with 'npm run dev' in a terminal window
// go to http://localhost:port/ to view your deployment!
// every time you change something in server.js and save, your deployment will automatically reload

// to exit, type 'ctrl + c', then press the enter key in a terminal window
// if you're prompted with 'terminate batch job (y/n)?', type 'y', then press the enter key in the same terminal

// standard modules, loaded from node_modules
const {MongoClient, ObjectId} = require('mongodb');
const path = require('path');
require("dotenv").config({ path: path.join(process.env.HOME, '.cs304env')});
const express = require('express');
const morgan = require('morgan');
const serveStatic = require('serve-static');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const flash = require('express-flash');
const multer = require('multer');
const bcrypt = require('bcrypt');
const ROUNDS = 10;

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

// main page
app.get('/', (req, res) => {
    const loggedIn = req.session.logged_in || false; // check if user is logged in
    const username = req.session.username || 'Guest'; // get username from session
    return res.render('homepage.ejs', {loggedIn, username});
});

// login page
app.get('/login', (req, res) => {
    return res.render('login.ejs');
});

// *************************** FEED STUFF *******************************
app.post('/review/', async (req, res) => {
    //create review and insert it into the database collection
    let review = {restaurant: req.body.restaurant,
                user: req.session.username,
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
        reviewsArray = await db.collection("reviews").find({user: {$regex: query}}).toArray();
    };
    console.log(reviewsArray);
    return res.render('feed.ejs', {reviews: reviewsArray, name: name, field: fieldname, search: 1});
});

// ----------------------------SIGN UP-----------------------------

app.post('/signup/', async (req, res) => {
    try {
        const name = req.body.name;
        const username = req.body.username;
        const password = req.body.password;

        const db = await Connection.open(mongoUri, "BlueBelly");
        var existingUser = await db.collection("users").findOne({username: username});
        console.log(existingUser);
        if (existingUser) {
          req.flash('error', "Login already exists - please try logging in instead. Or if new user, use a different username!");
          return res.redirect('/login')
        }

        const hash = await bcrypt.hash(password, ROUNDS);
        console.log("hash: ", hash);
        await db.collection("users").insertOne({
            name: name,
            username: username,
            hash: hash,
        });

        console.log('successfully joined', username, password, hash);
        req.flash('info', 'successfully joined and logged in as ' + username);
        req.session.username = username;
        req.session.logged_in = true;

        // redirect to home page that's then rendered with username
        // TODO: add render for username
        return res.redirect('/');
      } catch (error) {
        console.log("some error with form occurred")
        req.flash('error', `Form submission error: ${error}`);
        return res.redirect('/login')
      }

});

//---------------------------- LOGIN -----------------------------

app.post("/logging-in", async (req, res) => {
    try {
      const username = req.body.username;
      const password = req.body.password;
      const db = await Connection.open(mongoUri, "BlueBelly");
      var existingUser = await db.collection("users").findOne({username: username});
      console.log('user', existingUser);
      if (!existingUser) {
        req.flash('error', "Username does not exist - try again.");
       return res.redirect('/login')
      }
      const match = await bcrypt.compare(password, existingUser.hash);
      console.log('match', match);
      if (!match) {
          req.flash('error', "Username or password incorrect - try again.");
          return res.redirect('/login')
      }
      req.flash('info', 'successfully logged in as ' + username);
      req.session.username = username;
      req.session.logged_in = true;
      console.log('login as', username);
      return res.redirect('/');
    } catch (error) {
        console.log("some error with form occurred")
        req.flash('error', `Form submission error: ${error}`);
        return res.redirect('/login')
    }
  });

// ------------------------ LOGOUT ----------------------------

app.post('/logout/', (req, res) => {
    if (req.session.username) {
        req.session.username = null;
        req.session.logged_in = false;
        req.flash('info', 'You are logged out');
        // TODO: add redirect to homepage
        return res.redirect('/');
      } else {
        req.flash('error', 'You are not logged in - please do so.');
        // TODO: add redirect?
        return res.redirect('/');
      }
});

// ------------------------ PROFILE -----------------------------

app.get("/profile/", async (req, res) => {
    res.set("Cache-Control", "no-store"); // prevent caching
    let user = new RegExp(req.session.username);
    const db = await Connection.open(mongoUri, "BlueBelly");
    let reviewsArray = await db.collection("reviews").find({user: {$regex: user}}).toArray();
    console.log("Fetched reviews:", reviewsArray);
    res.render("user.ejs", {user: user, reviews: reviewsArray});
});

// ------------------------ DELETE REVIEW -------------------------

app.post('/review/delete/:review', async (req, res) => {
    const db = await Connection.open(mongoUri, "BlueBelly");
    let reviewID = new ObjectId(req.params.review.slice(1));
    await db.collection("reviews").deleteOne({_id: reviewID});

    return res.redirect("/profile/"); //reload profile
});

// ------------------------ EDIT REVIEW ---------------------------

// accessing correct review to edit
app.get('/review/edit/:restaurant', async (req, res) => {
    const db = await Connection.open(mongoUri, "BlueBelly");
    const restaurantName = req.params.restaurant;
    const username = req.session.username;

    let reviewID = new ObjectId(req.params.review.slice(1));
        await db.collection("reviews").findOne(
            {_id: reviewID},
        );


    if (!review) {
        req.flash('error', 'Review not found.');
        return res.redirect('/profile/');
    }

    res.render('edit-review.ejs', { review });
});

// updating the review
app.post('/review/edit/:review', async (req, res) => {
    const db = await Connection.open(mongoUri, "BlueBelly");

    const updatedReview = {
        address: req.body.address,
        rating: parseInt(req.body.rating),
        text: req.body.text,
    };

    try {
        let reviewID = new ObjectId(req.params.review);
        await db.collection("reviews").updateOne(
            {_id: reviewID},
            { $set: updatedReview }
        );

        if (result.matchedCount === 0) {
            req.flash('error', 'Review not found or not updated.');
            return res.redirect('/profile/');
        }

        req.flash('info', 'Review updated successfully.');
        return res.redirect('/profile/');
    } catch (error) {
        console.error('Error updating review:', error);
        req.flash('error', 'Error updating review.');
        return res.redirect('/profile/');
    }
});

// ================================================================
// postlude

const serverPort = cs304.getPort(8080);

// this is last, because it never returns
app.listen(serverPort, function() {
    console.log(`open http://localhost:${serverPort}`);
});
