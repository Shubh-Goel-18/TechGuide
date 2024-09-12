const express = require('express');
const session = require('express-session');
const passport = require('./config/passport-config'); // Import passport configuration
const authRoutes = require('./routes/auth'); // Import authentication routes
const indexRoutes = require('./routes/index'); // Import index routes
const profileRoutes = require('./routes/profile');

const bodyParser = require('body-parser'); // For parsing request bodies

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(bodyParser.json()); // Parse JSON bodies

// Session management
app.use(session({
  secret: 'your-secret-key', // Change this to a secure key
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set `secure: true` if using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Set up view engine if using template engine like EJS
app.set('view engine', 'ejs');


// Serve static files (CSS, JS)
app.use(express.static('public'));

// Use routes
app.use('/', authRoutes);
app.use('/', indexRoutes); // Add index routes
app.use('/', profileRoutes);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
