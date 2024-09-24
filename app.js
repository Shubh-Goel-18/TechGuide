const express = require('express');
const session = require('express-session');
const passport = require('./config/passport-config'); 
const authRoutes = require('./routes/auth'); 
const indexRoutes = require('./routes/index'); 
const profileRoutes = require('./routes/profile');

const bodyParser = require('body-parser'); 

const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false })); 
app.use(bodyParser.json()); 

// Session management
app.use(session({
  secret: 'your-secret-key', 
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } 
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
app.use('/', indexRoutes);
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
