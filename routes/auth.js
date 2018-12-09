// Load required Libraries
const express = require('express');
const router = express.Router();
const passport = require('passport');

// Request Page - Set the route for requesting authentication
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'] 
}));

// Callback - route used by Google OAuth 2.0 with success of failure result
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