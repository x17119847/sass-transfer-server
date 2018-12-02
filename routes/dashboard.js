const express = require('express');
const router = express.Router();
const { ensureAuthenticated } = require('../helpers/auth');
const mongoose = require('mongoose');

// Load Models
const User = mongoose.model('users');

// Dashboard Index
router.get('/', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    dashboardActive: true
  })
});

// Company
router.get('/company', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    companyActive: true
  })
});

// Bookings
router.get('/bookings', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    bookingsActive: true
  })
});

// Customers
router.get('/customers', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    customersActive: true
  })
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

// Vehicle Types
router.get('/vehicle-types', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    vehicleTypesActive: true
  })
});

// Vehicles
router.get('/vehicles', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    vehiclesActive: true
  })
});

// Drivers
router.get('/drivers', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    driversActive: true
  })
});

// Pax Types
router.get('/pax-types', ensureAuthenticated, (req, res) => {
  res.render('dashboard', {
    dashboardLink: true,
    paxTypesActive: true
  })
});

module.exports = router;