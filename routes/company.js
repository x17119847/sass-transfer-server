const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');

// Load Models
const User = mongoose.model('users');


// Update Company
router.post('/', (req, res) => {

  let name = req.body.name.trim();

  if(!name || name.length == 0) {
    req.flash('error_msg', 'Name cannot be blank');
    res.redirect('dashboard/company');
  }
  else {

    axios.put(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.company.id}?&access_token=${req.session.serverAccessToken}`, {
      name: name,
      email: req.session.company.email
    })
      .then(response => {
        req.session.companyID = response.data.id;
        req.flash('success_msg','Company name updated.')
        res.redirect('/dashboard/company')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
  
  }
})

module.exports = router;