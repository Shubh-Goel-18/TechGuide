const mysql = require('mysql2');

// Create a connection to the database
const db = mysql.createConnection({
  host: 'localhost', // Replace with your host name
  user: 'root', // Replace with your MySQL username
  password: 'Shubh@123', // Replace with your MySQL password
  database: 'techguide' // Replace with your database name
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = db;
