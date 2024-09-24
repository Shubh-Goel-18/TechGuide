const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../config/db'); 

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id, done) => {
  db.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) {
      return done(err);
    }
    if (results.length > 0) {
      return done(null, results[0]);
    }
    return done(null, false);
  });
});

// Local Strategy for authentication
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, (email, password, done) => {
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) {
      return done(err);
    }
    if (results.length > 0) {
      const user = results[0];
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          return done(err);
        }
        if (isMatch) {
          return done(null, user);
        }
        return done(null, false, { message: 'Incorrect password.' });
      });
    } else {
      return done(null, false, { message: 'No user found with that email.' });
    }
  });
}));

module.exports = passport;
