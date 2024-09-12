const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Ensure the path is correct

// Route to display and update user profile
router.get('/profile', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  const userId = req.user.id;

  // Fetch user details from the database
  db.query('SELECT username, email, profile_icon FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) {
      console.error('Error fetching user details:', err);
      return res.status(500).send('Server error');
    }
    const user = results[0];
    res.render('profile', { 
      username: user.username,
      email: user.email,
      profileIcon: user.profile_icon || 'user-profile.png' // Default icon if none selected
    });
  });
});

// Route to handle profile update
router.post('/update-profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const userId = req.user.id;
  const newUsername = req.body.username;

  // Update username in the database
  db.query('UPDATE users SET username = ? WHERE id = ?', [newUsername, userId], (err) => {
    if (err) {
      console.error('Error updating username:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    res.json({ success: true, message: 'Profile updated successfully' });
  });
});

// Route to handle profile icon update
router.post('/update-icon', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const userId = req.user.id;
  const newIcon = req.body.icon;

  // Update profile icon in the database
  db.query('UPDATE users SET profile_icon = ? WHERE id = ?', [newIcon, userId], (err) => {
    if (err) {
      console.error('Error updating profile icon:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    res.json({ success: true, message: 'Profile icon updated successfully' });
  });
});

module.exports = router;
