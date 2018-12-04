const express = require('express');
const router = express.Router();
const { 
  ensureAuthenticated, 
  authenticateServer, 
  validateWebUser
} = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');


// Load Models
const User = mongoose.model('users');

// Dashboard Index
router.get('/', 
  ensureAuthenticated, 
  authenticateServer,
  (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    dashboardActive: true
  })
});

// Company
router.get('/company', 
  ensureAuthenticated, 
  authenticateServer, 
  validateWebUser,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      req.session.company = response.data;
      res.render('dashboard', {
        dashboardLink: true,
        companyActive: true,
        companyID: req.session.companyID,
        company: response.data
      })
    })
    .catch(error => console.log('error getting company', `${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}access_token=${req.session.serverAccessToken}`));
});

// Bookings
router.get('/bookings', 
  ensureAuthenticated, 
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bookings?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      res.render('dashboard', {
        dashboardLink: true,
        bookingsActive: true,
        bookings: response.data,
        companyID: req.session.companyID
      })
    })
    .catch(error => console.log(error));
});

// Customers
router.get('/customers',
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bookings?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          dashboardLink: true,
          customersActive: true,
          customers: response.data,
          companyID: req.session.companyID
        })
      })
      .catch(error => console.log(error));
  });


// Service Bases
router.get('/bases', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    basesActive: true
  })
});

// Services
router.get('/services', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    servicesActive: true
  })
});

// Routes
router.get('/routes', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    routesActive: true
  })
});


// Vehicles
router.get('/vehicles', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    vehiclesActive: true
  })
});

module.exports = router;