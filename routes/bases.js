const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');
const async = require('async');

// Bases Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // async - perform queries in parallel
    async.parallel({
      bases: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bases?access_token=${req.session.serverAccessToken}&filter[include]=place`)
        .then(response => {
          callback(null, response.data);
        })
        .catch(error => console.log(error));          
      }
      // more parallel queries can be chained here...
    }, (error, results) => {
      if(error) {
        console.log(error);
      }
      else {                
        res.render('dashboard', {
          dashboardLink: true,
          basesActive: true,
          bases: results.bases,          
          companyID: req.session.companyID
        })
      }
    });
});

// Bases - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    res.render('dashboard', {
      dashboardLink: true,
      basesAddActive: true,
      companyID: req.session.companyID
    })
});

// Bases - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // async - perform queries in parallel
    async.parallel({
      base: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
          .then(response => {
            callback(null, response.data);
          })
          .catch(error => console.log(error));
      }
      // more parallel queries can be chained here...
    }, (error, results) => {
      if (error) {
        console.log(error);
      }
      else {        
        res.render('dashboard', {
          dashboardLink: true,
          basesEditActive: true,
          companyID: req.session.companyID,
          base: results.base
        })
      }
    });
});

// Base Create
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim();
    let errors = [];
    
    if (!name.length > 0) {
      errors.push({text:'Base Name cannot be blank.'})
    }
    if(errors.length > 0) {
      res.render('dashboard', {
        errors,
        name,
        dashboardLink: true,
        basesAddActive: true,
        companyID: req.session.companyID
      });
    }
    else {
      // Send Post Request to API Server
      axios.post(`${keys.sassTransferServiceAPIURI}/api/Bases?&access_token=${req.session.serverAccessToken}`, {
        name,
        companyId: req.session.companyID
      })
        .then(response => {      
          req.flash('success_msg','Base created.')
          res.redirect('/bases')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        })
    
    }
})

// Base Edit 
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim();
    let errors = [];

    if (!name.length > 0) {
      errors.push({ text: 'Base Name cannot be blank.' })
    }

    if (errors.length > 0) {      

      // async - perform queries in parallel
      async.parallel({
        base: callback => {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
            .then(response => {
              callback(null, response.data);
            })
            .catch(error => console.log(error));
        }
        // more parallel queries can be chained here...
      }, (error, results) => {
        if (error) {
          console.log(error);
        }
        else {
          res.render('dashboard', {
            dashboardLink: true,
            basesEditActive: true,
            companyID: req.session.companyID,
            base: results.base,            
            errors
          })
        }
      });

    }
    else {
      // Send Post Request to API Server
      axios.put(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {  
        name,
        companyId: req.session.companyID
      })
        .then(response => {
          req.flash('success_msg', 'Base updated.')
          res.redirect('/bases')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        })

    }
  })

// Base Delete
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // Send Post Request to API Server
    axios.delete(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
      body: JSON.stringify([
        req.params.id
      ])
    })
      .then(response => {
        console.log(response.data)
        req.flash('success_msg', 'Base deleted.')
        res.redirect('/bases')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
})

module.exports = router;