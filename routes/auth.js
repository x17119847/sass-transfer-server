const express = require('express');
const router = express.Router();
const passport = require('passport');

// Request Page
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'] 
}));

// Callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/'
  }), (req, res) => {
    // Successfull authentication
    res.redirect('/dashboard/company');
})

// Logout Route
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})

module.exports = router;