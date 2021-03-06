// Require JavaScript Libraries
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
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
        .catch(error => {
          //console.log(error)
          res.render('index/errorPage', {
            error: error
          })
        });          
      }
      // more parallel queries can be chained here...
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
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}&filter[include]=place`)
          .then(response => {
            // Check that the resouce belongs to the user requesting it
            if (response.data.companyId != req.session.companyID) {
              req.flash('error_msg', 'Unauthorized');
              res.redirect('/dashboard');
            } 
            else {
              callback(null, response.data);
            }
          })
          .catch(error => {
            //console.log(error)
            res.render('index/errorPage', {
              error: error
            })
          });
      }
      // more parallel queries can be chained here...
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
    let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
    let countyId = req.body.countyId.replace(/<(?:.|\n)*?>/gm, '');
    let countyName = req.body.countyName.replace(/<(?:.|\n)*?>/gm, '');
    let countryCode = 'IE';
    let errors = [];

    if (!countyId) {
      errors.push({ text: 'Please select a County.' })
    }
    if (!name.length > 0) {
      errors.push({text:'Base Name cannot be blank.'})
    }
    if(errors.length > 0) {
      res.render('dashboard', {
        errors,
        name,
        countyId,
        countyName,
        dashboardLink: true,
        basesAddActive: true,
        companyID: req.session.companyID
      });
    }
    else {
      // Send Post Request to API Server

      // Check if place already exists, if not, insert.
      axios.get(`${keys.sassTransferServiceAPIURI}/api/Places?filter={"where":{"countyId":"${countyId}"}}&access_token=${req.session.serverAccessToken}`)
      .then(response => {
        let place = response.data;
        if(!place.length > 0) {
          axios.post(`${keys.sassTransferServiceAPIURI}/api/Places?access_token=${req.session.serverAccessToken}`, {
            countyId,
            countyName,
            countryCode
          })
          .then(response => {            
            let placeId = response.data.id;
            axios.post(`${keys.sassTransferServiceAPIURI}/api/Bases?&access_token=${req.session.serverAccessToken}`, {
              name,
              companyId: req.session.companyID,
              placeId
            })
              .then(response => {
                req.flash('success_msg', 'Base created.')
                res.redirect('/bases')
              })
              .catch(error => {
                //console.log(error)
                res.render('index/errorPage', {
                  error: error
                })
              });
          })
          .catch(error => {
            res.render('index/errorPage', {
              error: error
            })
          });
        }
        else {          
          let placeId = place[0].id;
          axios.post(`${keys.sassTransferServiceAPIURI}/api/Bases?&access_token=${req.session.serverAccessToken}`, {
            name,
            companyId: req.session.companyID,
            placeId
          })
            .then(response => {
              req.flash('success_msg', 'Base created.')
              res.redirect('/bases')
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
        //console.log(error)
        res.render('index/errorPage', {
          error: error
        })
      });
    
    }
})

// Base Edit 
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // Set Variables
        let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
        let placeId = req.body.placeId.replace(/<(?:.|\n)*?>/gm, '');
        let countyId = req.body.countyId.replace(/<(?:.|\n)*?>/gm, '');
        let countyName = req.body.countyName.replace(/<(?:.|\n)*?>/gm, '');
        let countryCode = 'IE';
        let errors = [];

        if (!name.length > 0) {
          errors.push({ text: 'Base Name cannot be blank.' })
        }

        if (errors.length > 0) {

          // async - perform queries in parallel
          async.parallel({
            base: callback => {
              axios.get(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}&filter[include]=place`)
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
            // more parallel queries can be chained here...
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
                basesEditActive: true,
                companyID: req.session.companyID,
                base: results.base,
                errors,
                countyId
              })
            }
          });

        }
        else {

          // Send Post Request to API Server
          // Check if place already exists, if not, insert.
          axios.get(`${keys.sassTransferServiceAPIURI}/api/Places?filter={"where":{"countyId":"${countyId}"}}&access_token=${req.session.serverAccessToken}`)
            .then(response => {
              let place = response.data;
              if (!place.length > 0) {
                axios.post(`${keys.sassTransferServiceAPIURI}/api/Places?access_token=${req.session.serverAccessToken}`, {
                  countyId,
                  countyName,
                  countryCode
                })
                  .then(response => {
                    let placeId = response.data.id;
                    axios.put(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
                      name,
                      companyId: req.session.companyID,
                      placeId
                    })
                      .then(response => {
                        req.flash('success_msg', 'Base updated.')
                        res.redirect('/bases')
                      })
                      .catch(error => {
                        //console.log(error)
                        res.render('index/errorPage', {
                          error: error
                        })
                      });
                  })
                  .catch(error => {
                    res.render('index/errorPage', {
                      error: error
                    })
                  });
              }
              else {
                let placeId = place[0].id;
                axios.put(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
                  name,
                  companyId: req.session.companyID,
                  placeId
                })
                  .then(response => {
                    req.flash('success_msg', 'Base created.')
                    res.redirect('/bases')
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
              //console.log(error)
              res.render('index/errorPage', {
                error: error
              })
            });
        }
      }
    })
    .catch(error => {
      res.render('index/errorPage', {
        error: error
      });
    });
  });

// Base Delete
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // Send Post Request to API Server
        axios.delete(`${keys.sassTransferServiceAPIURI}/api/Bases/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
          body: JSON.stringify([
            req.params.id
          ])
        })
          .then(response => {
            req.flash('success_msg', 'Base deleted.')
            res.redirect('/bases')
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
      });
    })
})

module.exports = router;