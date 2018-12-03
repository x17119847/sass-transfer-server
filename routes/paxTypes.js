const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');

// Load Models



// Create Pax Type
router.post('/', (req, res) => {

  let paxType = req.body.paxType;

  if(!paxType > 0) {
    req.flash('error_msg', 'Please select a Pax Type');
    res.redirect('dashboard/pax-types/add');
  }
  else {
    // Send Post Request to API Server
    axios.post(`${keys.sassTransferServiceAPIURI}/api/PaxTypes?&access_token=${req.session.serverAccessToken}`, {
      paxType,
      companyId: req.session.companyID
    })
      .then(response => {      
        req.flash('success_msg','Pax Type created.')
        res.redirect('/dashboard/pax-types')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
  
  }
})

module.exports = router;