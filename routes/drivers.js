const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');

// Load Models


// Drivers Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/drivers?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          dashboardLink: true,
          driversActive: true,
          drivers: response.data,
          companyID: req.session.companyID
        })
      })
      .catch(error => console.log(error));
  });


// Drivers - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    res.render('dashboard', {
      dashboardLink: true,
      driversAddActive: true,
      companyID: req.session.companyID
    })

  });

// Drivers - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Drivers/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          dashboardLink: true,
          driversEditActive: true,
          companyID: req.session.companyID,
          driver: response.data
        })

      })
      .catch(error => console.log(error));
  });

// Create Driver
router.post('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    let name = req.body.name.trim();

    if (name.length == 0) {
      req.flash('error_msg', 'Please insert the driver name');
      res.redirect('/drivers/add');
    }
    else {
      // Send Post Request to API Server
      axios.post(`${keys.sassTransferServiceAPIURI}/api/Drivers?&access_token=${req.session.serverAccessToken}`, {
        name,
        companyId: req.session.companyID
      })
        .then(response => {
          req.flash('success_msg', 'Driver created.')
          res.redirect('/drivers')
        })
        .catch(error => {
          console.log(error);
        })

    }
  })

// Edit Driver
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    let name = req.body.name.trim();

    if (name.length == 0) {
      req.flash('error_msg', 'Please insert the driver name');
      res.redirect('/drivers/edit/' + req.params.id);
    }
    else {
      // Send Post Request to API Server
      axios.put(`${keys.sassTransferServiceAPIURI}/api/Drivers/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
        name,
        companyId: req.session.companyID
      })
        .then(response => {
          req.flash('success_msg', 'Driver updated.')
          res.redirect('/drivers')
        })
        .catch(error => {
          console.log(error);
        })

    }
  })

// Delete Driver
router.get('/delete/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // Send Post Request to API Server
    axios.delete(`${keys.sassTransferServiceAPIURI}/api/Drivers/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
      body: JSON.stringify([
        req.params.id
      ])
    })
      .then(response => {
        req.flash('success_msg', 'Driver deleted.')
        res.redirect('/drivers')
      })
      .catch(error => {
        console.log(error);
      })
  })

module.exports = router;