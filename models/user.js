// models/user.js
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const db = require('../config/db');


module.exports = {
  findUserByEmail: (email, callback) => {
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
      if (error) return callback(error);
      callback(null, results[0]);
    });
  },
  createUser: (user, callback) => {
    bcrypt.hash(user.password, 10, (err, hash) => {
      if (err) return callback(err);
      user.password = hash;
      db.query('INSERT INTO users SET ?', user, (error, results) => {
        if (error) return callback(error);
        callback(null, results);
      });
    });
  },
  updateUserOTP: (email, otp, callback) => {
    db.query('UPDATE users SET otp = ? WHERE email = ?', [otp, email], (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  },
  verifyUser: (email, callback) => {
    db.query('UPDATE users SET isVerified = 1, otp = NULL WHERE email = ?', [email], (error, results) => {
      if (error) return callback(error);
      callback(null, results);
    });
  }
};
