const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const captcha = require('node-captcha-generator');
const nodemailer = require('nodemailer');
const db = require('../config/db'); // Ensure the path is correct

// Helper function to get username and profile icon
const getUserData = (req, callback) => {
  if (req.isAuthenticated()) {
    const userId = req.user.id;

    db.query('SELECT profile_icon, username FROM users WHERE id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Database query failed:', err);
        callback(err, null, 'user-profile.png');
      } else {
        const profileIcon = results[0]?.profile_icon || 'user-profile.png'; // Default if none selected
        const username = results[0]?.username || 'Guest';
        callback(null, username, profileIcon);
      }
    });
  } else {
    callback(null, 'Guest', 'user-profile.png');
  }
};

// Redirect root to home
router.get('/', (req, res) => {
  res.redirect('/home');
});

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Render signup page
router.get('/signup', (req, res) => {
  res.render('signup');
});

// Render OTP page
router.get('/otp', (req, res) => {
  res.render('otp');
});

// Render home page with profile icon
router.get('/home', (req, res) => {
  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.render('home', { username, profileIcon });
  });
});

// Handle logout
router.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// Render learning page
router.get('/learning', (req, res) => {
  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.render('learning', { username, profileIcon });
  });
});

// Handle downloads
router.get('/download/:resource', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  const resource = req.params.resource;
  const filePath = path.join(__dirname, '../public/pdfs', resource);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('File not found');
    } else {
      const userId = req.user.id;
      db.query('INSERT INTO user_downloads (user_id, resource, date) VALUES (?, ?, NOW())', [userId, resource], (err) => {
        if (err) {
          console.error('Error recording download:', err);
        }
      });
    }
  });
});

// Render downloads page
router.get('/downloads', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    const userId = req.user.id;

    db.query('SELECT * FROM user_downloads WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching downloads:', err);
        return res.status(500).send('Server error');
      }
      res.render('download', { downloads: results, username, profileIcon });
    });
  });
});

// Delete a specific download
router.delete('/delete/:id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const downloadId = req.params.id;

  db.query('DELETE FROM user_downloads WHERE id = ? AND user_id = ?', [downloadId, req.user.id], (err) => {
    if (err) {
      console.error('Error deleting download:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    res.json({ success: true });
  });
});

// Clear all downloads
router.post('/clear-all', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  db.query('DELETE FROM user_downloads WHERE user_id = ?', [req.user.id], (err) => {
    if (err) {
      console.error('Error clearing downloads:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    res.json({ success: true });
  });
});

// Render quizzes page
router.get('/quizzes', (req, res) => {
  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.render('quizzes', { username, profileIcon });
  });
});

// Render specific quiz
router.get('/quiz/:language', (req, res) => {
  const language = req.params.language;
  const filePath = path.join(__dirname, '../views/questions.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading questions file:', err);
      res.status(500).send('Error loading questions');
      return;
    }

    const questions = JSON.parse(data)[language];

    if (!questions) {
      res.status(404).send('No questions found for this language');
      return;
    }

    getUserData(req, (err, username, profileIcon) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.render('quiz', { language, questions, username, profileIcon });
    });
  });
});

// Render quiz result page
router.get('/result', (req, res) => {
  const { score, total } = req.query;
  const quizLanguage = req.query.language || 'Unknown';

  if (req.isAuthenticated()) {
    const userId = req.user.id;

    db.query(
      'INSERT INTO quiz_attempts (user_id, quiz_language, score, total_questions, attempt_date) VALUES (?, ?, ?, ?, NOW())',
      [userId, quizLanguage, score, total],
      (err) => {
        if (err) {
          console.error('Error inserting quiz attempt:', err);
        }
      }
    );
  }

  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.render('result', { score, total, username, profileIcon });
  });
});

// Render quiz attempts page
router.get('/attempts', (req, res) => {
  if (!req.user) {
    return res.redirect('/login');
  }

  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }

    const userId = req.user.id;

    db.query('SELECT * FROM quiz_attempts WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error fetching attempts:', err);
        return res.status(500).send('Server error');
      }
      res.render('attempts', { attempts: results, username, profileIcon });
    });
  });
});

// Render coding algorithms page
router.get('/coding-algorithms', (req, res) => {
  const questionsPath = path.join(__dirname, '../views/algorithms.json');

  let questionsData;
  try {
    questionsData = JSON.parse(fs.readFileSync(questionsPath, 'utf8'));
  } catch (err) {
    console.error('Error reading questions file:', err);
    questionsData = [];
  }

  getUserData(req, (err, username, profileIcon) => {
    if (err) {
      return res.status(500).send('Server error');
    }
    res.render('coding-algorithms', { username, profileIcon, questions: questionsData });
  });
});

// Render specific algorithm details
router.get('/algorithm/:id', (req, res) => {
  const algorithmId = Number(req.params.id);
  const jsonFilePath = path.join(__dirname, '../views/algorithms.json');

  fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading JSON file');
    }

    const algorithms = JSON.parse(data);
    const algorithm = algorithms.find(algo => algo.id === algorithmId);

    if (!algorithm) {
      return res.status(404).send('Algorithm not found');
    }

    getUserData(req, (err, username, profileIcon) => {
      if (err) {
        return res.status(500).send('Server error');
      }
      res.render('algorithm-details', { algorithm, username, profileIcon });
    });
  });
});


router.get('/contact', async (req, res) => {
  try {
    const cap = new captcha({
      length: 6,
      size: {
        width: 400,
        height: 200,
      },
    });

    await cap.toBase64((err, base64) => {
      if (err) throw err;
      return res.render('contact', { src: base64, value: cap.value });
    });
  } catch (err) {
    console.error('Error generating captcha:', err);
    res.status(500).send('Error generating captcha');
  }
});

// POST /contact - Handle contact form submission
router.post('/contact', async (req, res) => {
  const { captcha: userCaptcha, value: originalValue, message } = req.body;

  if (userCaptcha !== originalValue) {
    // Incorrect captcha
    const cap = new captcha({
      length: 6,
      size: {
        width: 400,
        height: 200,
      },
    });

    await cap.toBase64((err, base64) => {
      if (err) throw err;
      return res.render('contact', {
        src: base64,
        value: cap.value,
        error: 'Incorrect captcha, please try again.',
      });
    });
  } else {
    // Captcha is correct, send email
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'shubhgoel559@gmail.com', // Replace with your email address
        pass: 'hwna sphk hrfi zyir' 
      },
    });

    let mailOptions = {
      from: 'shubhgoel83@gmail.com',
      to: 'shubhgoel559@gmail.com',
      subject: 'Contact Form Submission',
      text: message,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).send('Error sending email');
      } else {
        console.log('Email sent: ' + info.response);
        res.render('success', { message: 'Your message has been sent successfully!' });
      }
    });
  }
});


module.exports = router;
