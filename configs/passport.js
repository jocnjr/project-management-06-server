const User = require('../models/user-model');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs'); // !!!
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;


passport.serializeUser((loggedInUser, cb) => {
  cb(null, loggedInUser._id);
});

passport.deserializeUser((userIdFromSession, cb) => {
  User.findById(userIdFromSession, (err, userDocument) => {
    if (err) {
      cb(err);
      return;
    }
    cb(null, userDocument);
  });
});

passport.use(new LocalStrategy((username, password, next) => {
  User.findOne({
    username
  }, (err, foundUser) => {
    if (err) {
      next(err);
      return;
    }

    if (!foundUser) {
      next(null, false, {
        message: 'Incorrect username.'
      });
      return;
    }

    if (!bcrypt.compareSync(password, foundUser.password)) {
      next(null, false, {
        message: 'Incorrect password.'
      });
      return;
    }

    next(null, foundUser);
  });
}));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/api/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    console.log(profile)
    User.findOne({
        googleID: profile.id
      })
      .then(user => {
        if (user) {
          done(null, user);
          return;
        }

        User.create({
            googleID: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value
          })
          .then(newUser => {
            done(null, newUser);
          })
          .catch(err => done(err)); // closes User.create()
      })
      .catch(err => done(err)); // closes User.findOne()
  }
));