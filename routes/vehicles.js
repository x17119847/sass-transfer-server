// Require JavaScript Libraries
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const axios = require('axios');
const keys = require('../config/keys');
const async = require('async');

// Vehicles Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // async - perform queries in parallel
    async.parallel({
      vehicles: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicles?access_token=${req.session.serverAccessToken}&filter[include]=vehicleType`)
        .then(response => {
          callback(null, response.data);
        })
        .catch(error => {
          //console.log(error)
          res.render('index/errorPage', {
            error: error
          }) 
        });          
      },
      vehicleTypes: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicleTypes?access_token=${req.session.serverAccessToken}`)
        .then(response => {
          callback(null, response.data);
        })
        .catch(error => {
          //console.log(error)
          res.render('index/errorPage', {
            error: error
          }) 
        });        
      }
    }, (error, results) => {
      if(error) {
        //console.log(error);
        res.render('index/errorPage', {
          error: error
        })
      }
      else {        
        res.render('dashboard', {
          dashboardLink: true,
          vehiclesActive: true,
          vehicles: results.vehicles,
          vehicleTypes: results.vehicleTypes,
          companyID: req.session.companyID
        })
      }
    });
});

// Vehicle - Add Page
router.get('/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicleTypes?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      res.render('dashboard', {
        dashboardLink: true,
        vehiclesAddActive: true,
        vehicleTypes: response.data,
        vehicleTypeId: '',
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

// Vehicle - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // async - perform queries in parallel
        async.parallel({
          vehicle: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
              .then(response => {
                callback(null, response.data);
              })
              .catch(error => {
                //console.log(error)
                res.render('index/errorPage', {
                  error: error
                })
              });
          },
          vehicleTypes: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicleTypes?access_token=${req.session.serverAccessToken}`)
              .then(response => {
                callback(null, response.data);
              })
              .catch(error => {
                //console.log(error)
                res.render('index/errorPage', {
                  error: error
                })
              });
          }
        }, (error, results) => {
          if (error) {
            //console.log(error);
            res.render('index/errorPage', {
              error: error
            })
          }
          else {
            //console.log(results);
            res.render('dashboard', {
              dashboardLink: true,
              vehiclesEditActive: true,
              companyID: req.session.companyID,
              vehicle: results.vehicle,
              vehicleTypes: results.vehicleTypes
            })
          }
        });
      }
    })
    .catch(error => {
      res.render('index/errorPage', {
        error: error
      })
    });
});

// Create Vehicle
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let vehicleTypeId = req.body.vehicleTypeId.replace(/<(?:.|\n)*?>/gm, '');
    let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
    let registration = req.body.registration.trim().replace(/<(?:.|\n)*?>/gm, '');
    let errors = [];
    
    if (!vehicleTypeId) {
      errors.push({ text: 'Please select the Vehicle Type' });
    }
    if (!name.length > 0) {
      errors.push({text:'Vehicle Name cannot be blank.'})
    }
    if(errors.length > 0) {
      axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicleTypes?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        res.render('dashboard', {
          errors,
          registration,
          name,
          vehicleTypeId,
          vehicleTypes: response.data,
          dashboardLink: true,
          vehiclesAddActive: true,
          companyID: req.session.companyID
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
      axios.post(`${keys.sassTransferServiceAPIURI}/api/Vehicles?&access_token=${req.session.serverAccessToken}`, {
        registration,
        name,
        vehicleTypeId,
        companyId: req.session.companyID
      })
        .then(response => {      
          req.flash('success_msg','Vehicle created.')
          res.redirect('/vehicles')
        })
        .catch(error => {
          //console.log(error);
          res.render('index/errorPage', {
            error: error
          })
        })
    
    }
})

// Edit Vehicle
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // Set Variables
        let vehicleTypeId = req.body.vehicleTypeId.replace(/<(?:.|\n)*?>/gm, '');
        let registration = req.body.registration.trim().replace(/<(?:.|\n)*?>/gm, '');
        let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
        let errors = [];

        if (!name.length > 0) {
          errors.push({ text: 'Vehicle Name cannot be blank.' })
        }
        if (!vehicleTypeId) {
          errors.push({ text: 'Please select the Vehicle Type' });
        }

        if (errors.length > 0) {

          // async - perform queries in parallel
          async.parallel({
            vehicle: callback => {
              axios.get(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
                .then(response => {
                  callback(null, response.data);
                })
                .catch(error => {
                  //console.log(error)
                  res.render('index/errorPage', {
                    error: error
                  })
                });
            },
            vehicleTypes: callback => {
              axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/vehicleTypes?access_token=${req.session.serverAccessToken}`)
                .then(response => {
                  callback(null, response.data);
                })
                .catch(error => {
                  //console.log(error)
                  res.render('index/errorPage', {
                    error: error
                  })
                });
            }
          }, (error, results) => {
            if (error) {
              //console.log(error);
              res.render('index/errorPage', {
                error: error
              })
            }
            else {
              res.render('dashboard', {
                dashboardLink: true,
                vehiclesEditActive: true,
                companyID: req.session.companyID,
                vehicle: results.vehicle,
                vehicleTypes: results.vehicleTypes,
                errors
              })
            }
          });

        }
        else {
          // Send Post Request to API Server
          axios.put(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
            registration,
            name,
            vehicleTypeId,
            companyId: req.session.companyID
          })
            .then(response => {
              req.flash('success_msg', 'Vehicle updated.')
              res.redirect('/vehicles')
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

// Delete Vehicle
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?access_token=${req.session.serverAccessToken}`)
      .then(response => {
        // Check that the resouce belongs to the user requesting it
        if (response.data.companyId != req.session.companyID) {
          req.flash('error_msg', 'Unauthorized');
          res.redirect('/dashboard');
        }
        else {
          // Send Post Request to API Server
          axios.delete(`${keys.sassTransferServiceAPIURI}/api/Vehicles/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
            body: JSON.stringify([
              req.params.id
            ])
          })
            .then(response => {
              req.flash('success_msg', 'Vehicle deleted.')
              res.redirect('/vehicles')
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