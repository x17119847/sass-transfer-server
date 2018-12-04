const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');

// Load Models


// Pax Types Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          dashboardLink: true,
          paxTypesActive: true,
          paxTypes: response.data,
          companyID: req.session.companyID
        })
      })
      .catch(error => console.log(error));
  });


// Pax Types - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    res.render('dashboard', {
      dashboardLink: true,
      paxTypesAddActive: true,
      companyID: req.session.companyID
    })

  });

// Pax Types - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          dashboardLink: true,
          paxTypesEditActive: true,
          companyID: req.session.companyID,
          paxType: response.data
        })

      })
      .catch(error => console.log(error));
  });

// Create Pax Type
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

  let paxType = req.body.paxType;

  if(!paxType > 0) {
    req.flash('error_msg', 'Please select a Pax Type');
    res.redirect('/pax-types/add');
  }
  else {
    // Send Post Request to API Server
    axios.post(`${keys.sassTransferServiceAPIURI}/api/PaxTypes?&access_token=${req.session.serverAccessToken}`, {
      paxType,
      companyId: req.session.companyID
    })
      .then(response => {      
        req.flash('success_msg','Pax Type created.')
        res.redirect('/pax-types')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
  
  }
})

// Edit Pax Type
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    let paxType = req.body.paxType;

    if (!paxType > 0) {
      req.flash('error_msg', 'Please select a Pax Type');
      res.redirect('/pax-types/edit/' + req.params.id);
    }
    else {
      // Send Post Request to API Server
      axios.put(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
        paxType,
        companyId: req.session.companyID
      })
        .then(response => {
          req.flash('success_msg', 'Pax Type updated.')
          res.redirect('/pax-types')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        })

    }
  })

// Delete Pax Type
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // Send Post Request to API Server
    axios.delete(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
      body: JSON.stringify([
        req.params.id
      ])
    })
      .then(response => {
        console.log(response.data)
        req.flash('success_msg', 'Pax Type deleted.')
        res.redirect('/pax-types')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
})

module.exports = router;