const express = require('express');
const router = express.Router();
const {ensureAuthenticated} = require('../helpers/auth');
const {ensureGuest} = require('../helpers/auth');
const mongoose = require('mongoose');


// Index
router.get('/', (req, res) => {
  res.render('index/welcome', {
    homeLink: true
  })
});

// Login Page
router.get('/login', (req, res) => {
  res.render('index/login', {
    loginLink: true
  });
});

// Logout User
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You have logged out');
  res.redirect('/login');
});

// About - Learn More
router.get('/about', (req, res) => {
  res.render('index/about', {
    aboutLink: true
  })
});

// Block routes
router.get('/company', (req, res) => {
  res.redirect('/');
})

module.exports = router;