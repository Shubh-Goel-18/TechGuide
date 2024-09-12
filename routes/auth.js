const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require('../config/db'); // Your database connection
const nodemailer = require('nodemailer');

// Configure nodemailer with your email service provider
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Use Gmail or replace with your email service provider
  auth: {
    user: 'shubhgoel559@gmail.com', // Replace with your email address
    pass: 'hwna sphk hrfi zyir'   // Replace with your email password or app-specific password
  }
});

// Helper function to generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

// Function to send OTP email
const sendOTPEmail = (to, otp) => {
  const mailOptions = {
    from: 'shubhgoel559@gmail.com', // Replace with your email address
    to: to,                      // List of recipients
    subject: 'Your OTP Code',    // Subject line
    text: `Your OTP code is ${otp}. It expires in 10 minutes.` // Plain text body
  };

  return transporter.sendMail(mailOptions);
};

// Sign Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if the user already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.redirect('/signup');
    }

    if (results.length > 0) {
      // User already exists
      return res.render('signup', { message: 'User already exists' });
    }

    // User does not exist, proceed with signup
    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60000); // OTP expires in 10 minutes

    db.query(
      'INSERT INTO users (username, email, password, otp, otp_expiry) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, otp, otpExpiry],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.redirect('/signup');
        }

        // Send OTP to user's email
        sendOTPEmail(email, otp)
          .then(() => {
            res.redirect('/otp');
          })
          .catch((err) => {
            console.error('Error sending OTP email:', err);
            res.redirect('/signup');
          });
      }
    );
  });
});

// OTP Verification Route
router.post('/verify-otp', async (req, res) => {
  const { otp } = req.body;

  db.query('SELECT * FROM users WHERE otp = ?', [otp], (err, results) => {
    if (err) {
      console.error(err);
      return res.render('otp', { message: 'An error occurred, please try again.' });
    }

    if (results.length > 0) {
      const user = results[0];
      const now = new Date();

      if (user.otp_expiry && now > user.otp_expiry) {
        return res.render('otp', { message: 'OTP has expired, please request a new one.' });
      }

      // OTP is valid, clear the OTP and expiry from the database
      db.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = ?', [user.id], (err) => {
        if (err) {
          console.error(err);
          return res.render('otp', { message: 'An error occurred, please try again.' });
        }

        res.redirect('/login');
      });
    } else {
      res.render('otp', { message: 'Invalid OTP, please try again.' });
    }
  });
});

// Login Route
router.post('/login', (req, res, next) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.redirect('/login');
    }

    if (results.length === 0) {
      // User does not exist
      return res.render('login', { message: 'User does not exist with this email.' });
    }

    const user = results[0];

    // Check if the password is correct
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.render('login', { message: 'Incorrect password. Please try again.' });
    }

    // If everything is fine, authenticate using Passport
    req.login(user, (err) => {
      if (err) {
        console.error(err);
        return res.redirect('/login');
      }
      return res.redirect('/home');
    });
  });
});

// Logout Route
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

module.exports = router;
