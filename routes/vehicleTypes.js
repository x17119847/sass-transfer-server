// Require JavaScript Libraries
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const axios = require('axios');
const keys = require('../config/keys');

// Vehicle Types Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicleTypes?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      res.render('dashboard', {
        dashboardLink: true,
        vehicleTypesActive: true,
        vehicleTypes: response.data,
        companyID: req.session.companyID
      })
    })
    .catch(error => {
      //console.log(error)
      res.render('index/errorPage', {
        error: error
      }) 
    });
});

// Vehicle Types - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    res.render('dashboard', {
      dashboardLink: true,
      vehicleTypesAddActive: true,
      companyID: req.session.companyID
    })
});

// Vehicle Types - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        // Check that the resouce belongs to the user requesting it
        if (response.data.companyId != req.session.companyID) {
          req.flash('error_msg', 'Unauthorized');
          res.redirect('/dashboard');
        }
        else {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
            .then(response => {
              res.render('dashboard', {
                dashboardLink: true,
                vehicleTypesEditActive: true,
                companyID: req.session.companyID,
                vehicleType: response.data
              })

            })
            .catch(error => {
              //console.log(error)
              res.render('index/errorPage', {
                error: error
              })
            });
        }
      })
      .catch(error => {
        res.render('index/errorPage', {
          error: error
        })
      });
});

// Create Vehicle Type
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let max_pax = parseInt(req.body.max_pax).replace(/<(?:.|\n)*?>/gm, '');
    let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
    let errors = [];

    if (!name.length > 0) {
      errors.push({text:'Name cannot be blank.'})
    }
    if(!max_pax > 0) {
      errors.push({ text:'Maximum Passengers must be more than zero.'})
    }

    if(errors.length > 0) {
      res.render('dashboard', {
        errors,
        max_pax,
        name,
        dashboardLink: true,
        vehicleTypesAddActive: true,
        companyID: req.session.companyID
      });
    }
    else {
      // Send Post Request to API Server
      axios.post(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes?&access_token=${req.session.serverAccessToken}`, {
        max_pax,
        name,
        companyId: req.session.companyID
      })
        .then(response => {      
          req.flash('success_msg','Vehicle Type created.')
          res.redirect('/vehicle-types')
        })
        .catch(error => {
          //console.log(error);
          res.render('index/errorPage', {
            error: error
          })
        })
    }
})

// Edit Vehicle Type
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        // Check that the resouce belongs to the user requesting it
        if (response.data.companyId != req.session.companyID) {
          req.flash('error_msg', 'Unauthorized');
          res.redirect('/dashboard');
        }
        else {
          // Set Variables
          let max_pax = parseInt(req.body.max_pax).replace(/<(?:.|\n)*?>/gm, '');
          let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
          let errors = [];

          if (!name.length > 0) {
            errors.push({ text: 'Name cannot be blank.' })
          }
          if (!max_pax > 0) {
            errors.push({ text: 'Maximum Passengers must be more than zero.' })
          }

          if (errors.length > 0) {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
              .then(response => {
                res.render('dashboard', {
                  dashboardLink: true,
                  vehicleTypesEditActive: true,
                  companyID: req.session.companyID,
                  vehicleType: response.data,
                  errors
                });
              })
              .catch(error => {
                //console.log(error)
                res.render('index/errorPage', {
                  error: error
                })
              });
          }
          else {
            // Send Post Request to API Server
            axios.put(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
              max_pax,
              name,
              companyId: req.session.companyID
            })
              .then(response => {
                req.flash('success_msg', 'Vehicle Type updated.')
                res.redirect('/vehicle-types')
              })
              .catch(error => {
                //console.log(error);
                res.render('index/errorPage', {
                  error: error
                })
              })

          }
        }
      })
      .catch(error => {
        res.render('index/errorPage', {
          error: error
        })
      });
  })

// Delete Vehicle Type
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        // Check that the resouce belongs to the user requesting it
        if (response.data.companyId != req.session.companyID) {
          req.flash('error_msg', 'Unauthorized');
          res.redirect('/dashboard');
        }
        else {
          // Send Post Request to API Server
          axios.delete(`${keys.sassTransferServiceAPIURI}/api/VehicleTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
            body: JSON.stringify([
              req.params.id
            ])
          })
            .then(response => {
              req.flash('success_msg', 'Vehicle Type deleted.')
              res.redirect('/vehicle-types')
            })
            .catch(error => {
              //console.log(error);
              res.render('index/errorPage', {
                error: error
              })
            })
        }
      })
      .catch(error => {
        res.render('index/errorPage', {
          error: error
        })
      });
})

module.exports = router;