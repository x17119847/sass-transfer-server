const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const mongoose = require('mongoose');
const axios = require('axios');
const keys = require('../config/keys');
const async = require('async');

// Routes Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // async - perform queries in parallel
    async.parallel({
      routes: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/routes?access_token=${req.session.serverAccessToken}&filter[include][service]=base`)
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
          routesActive: true,
          routes: results.routes,          
          companyID: req.session.companyID
        });
      }
    });
});

// Routes - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include]=base`)
    .then(response => {      
      res.render('dashboard', {
        dashboardLink: true,
        routesAddActive: true,
        services: response.data,
        companyID: req.session.companyID
      })
    })
    .catch(error => console.log(error));
});

// Services - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // async - perform queries in parallel
    async.parallel({
      route: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
          .then(response => {
            callback(null, response.data);
          })
          .catch(error => console.log(error));
      },
      services: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include]=base`)
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
          routesEditActive: true,
          companyID: req.session.companyID,
          services: results.services,
          route: results.route
        })
      }
    });
});

// Route Create
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim();
    let serviceId = req.body.serviceId;
    let errors = [];
    
    if (!name.length > 0) {
      errors.push({text:'Destination Name cannot be blank.'});
    }
    if (!serviceId) {
      errors.push({text: "Please select a Service."});
    }
    if(errors.length > 0) {
      axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include]=base`)
      .then(response => {
        res.render('dashboard', {
          errors,
          name,
          serviceId,
          services: response.data,
          dashboardLink: true,
          routesAddActive: true,
          companyID: req.session.companyID
        });
      })
      .catch(errors => console.log(errors));
    }
    else {
      // Send Post Request to API Server
      axios.post(`${keys.sassTransferServiceAPIURI}/api/Routes?&access_token=${req.session.serverAccessToken}`, {
        name,
        serviceId,
        companyId: req.session.companyID
      })
        .then(response => {      
          req.flash('success_msg','Destination created.')
          res.redirect('/routes')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        })
    
    }
})

// Route Edit 
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim();
    let serviceId = req.body.serviceId;
    let errors = [];

    if (!name.length > 0) {
      errors.push({ text: 'Destination Name cannot be blank.' });
    }
    if(!serviceId) {
      errors.push({text: "Please select the Service."});
    }
    if (errors.length > 0) {      

      // async - perform queries in parallel
      async.parallel({
        route: callback => {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
            .then(response => {
              callback(null, response.data);
            })
            .catch(error => console.log(error));
        },
        services: callback => {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include]=base`)
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
            routesEditActive: true,
            companyID: req.session.companyID,
            services: results.services,
            route: results.route,            
            errors
          });
        }
      });

    }
    else {
      // Send Post Request to API Server
      axios.put(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {  
        name,
        serviceId,
        companyId: req.session.companyID
      })
        .then(response => {
          req.flash('success_msg', 'Destination updated.')
          res.redirect('/routes')
        })
        .catch(error => {
          console.log('ERROR')
          console.log(error);
        });
    }
  })

// Route Delete
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // Send Post Request to API Server
    axios.delete(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
      body: JSON.stringify([
        req.params.id
      ])
    })
      .then(response => {
        console.log(response.data)
        req.flash('success_msg', 'Destination deleted.')
        res.redirect('/routes')
      })
      .catch(error => {
        console.log('ERROR')
        console.log(error);
      })
})

module.exports = router;