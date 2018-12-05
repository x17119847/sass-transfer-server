const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');
const async = require('async');

// Service Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // async - perform queries in parallel
    async.parallel({
      services: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?access_token=${req.session.serverAccessToken}&filter[include]=base`)
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
          servicesActive: true,
          services: results.services,          
          companyID: req.session.companyID
        });
      }
    });
});

// Services - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bases?&access_token=${req.session.serverAccessToken}`)
    .then(response => {      
      res.render('dashboard', {
        dashboardLink: true,
        servicesAddActive: true,
        bases: response.data,
        companyID: req.session.companyID
      })
    })
    .catch(error => console.log(error));
});

// Bases - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // async - perform queries in parallel
    async.parallel({
      service: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Services/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
          .then(response => {
            callback(null, response.data);
          })
          .catch(error => console.log(error));
      },
      bases: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bases?&access_token=${req.session.serverAccessToken}`)
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
          servicesEditActive: true,
          companyID: req.session.companyID,
          bases: results.bases,
          service: results.service
        })
      }
    });
});

// Service Create
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim();
    let baseId = req.body.baseId;
    let errors = [];
    
    if (!name.length > 0) {
      errors.push({text:'Service Name cannot be blank.'});
    }
    if (!baseId) {
      errors.push({text: "Please select a Service Base."});
    }
    if(errors.length > 0) {
      axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bases?&access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          errors,
          name,
          baseId,
          bases: response.data,
          dashboardLink: true,
          servicesAddActive: true,
          companyID: req.session.companyID
        });
      })
      .catch(errors => console.log(errors));
    }
    else {
      // Send Post Request to API Server
      axios.post(`${keys.sassTransferServiceAPIURI}/api/Services?&access_token=${req.session.serverAccessToken}`, {
        name,
        baseId,
        companyId: req.session.companyID
      })
        .then(response => {      
          req.flash('success_msg','Service created.')
          res.redirect('/services')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        })
    
    }
})

// Service Edit 
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim();
    let baseId = req.body.baseId;
    let errors = [];

    if (!name.length > 0) {
      errors.push({ text: 'Base Name cannot be blank.' });
    }
    if(!baseId) {
      errors.push({text: "Please select the Service Base."});
    }
    if (errors.length > 0) {      

      // async - perform queries in parallel
      async.parallel({
        service: callback => {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/Services/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
            .then(response => {
              callback(null, response.data);
            })
            .catch(error => console.log(error));
        },
        bases: callback => {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/bases?&access_token=${req.session.serverAccessToken}`)
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
            servicesEditActive: true,
            companyID: req.session.companyID,
            bases: results.bases,
            service: results.service,            
            errors
          })
        }
      });

    }
    else {
      // Send Post Request to API Server
      axios.put(`${keys.sassTransferServiceAPIURI}/api/Services/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {  
        name,
        baseId,
        companyId: req.session.companyID
      })
        .then(response => {
          req.flash('success_msg', 'Service updated.')
          res.redirect('/services')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        });
    }
  })

// Service Delete
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // Send Post Request to API Server
    axios.delete(`${keys.sassTransferServiceAPIURI}/api/Services/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
      body: JSON.stringify([
        req.params.id
      ])
    })
      .then(response => {
        console.log(response.data)
        req.flash('success_msg', 'Service deleted.')
        res.redirect('/services')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
})

module.exports = router;