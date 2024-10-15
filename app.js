const dotenv = require("dotenv");
dotenv.config();
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
const passport = require('passport');
const { users } = require("./model/index");

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, cb) {
    cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
    cb(null, obj);
});

// View Engine
app.set("view engine", "ejs");

//routes
const organizationRoute = require('./routes/organizationRoute')

app.use('',organizationRoute)
// Home route
app.get("/", (req, res) => {
    res.render("home.ejs");
});

// Google OAuth2 Strategy
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
}, async function(accessToken, refreshToken, profile, done) {
    userProfile = profile;
    return done(null, userProfile);
}));

// Routes
app.get("/auth/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get("/auth/google/callback", passport.authenticate('google', {
    failureRedirect: "http://localhost:3000"
}), async function(req, res) {
    try {
        // Check for duplicate email
        const duplicateEmail = await users.findOne({
            where: {
                email: userProfile.emails[0].value
            }
        });

        if (duplicateEmail) {
               // Generate JWT token
            const token = jwt.sign({ id: duplicateEmail.id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
            res.cookie('token', token);
            res.redirect("/addOrganization");

        }else{

        // Create a new user in the database
        const data = await users.create({
            username: userProfile.displayName,
            email: userProfile.emails[0].value,
            googleId: userProfile.id
        });

        // Generate JWT token
        const token = jwt.sign({ id: data.id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });

        // Set the JWT token in cookies
        res.cookie('token', token);
        res.redirect("/addOrganization");
    }
    } catch (error) {
        console.error("Error during user registration or JWT token creation:", error);
        res.status(500).send("Internal server error");
    }
});

// Start the server
const server = app.listen(port, () => {
    console.log("Server is starting on port:" + port);
});
