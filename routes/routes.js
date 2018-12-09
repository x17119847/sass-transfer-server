// Load JavaScript Libraries
const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const axios = require('axios');
const keys = require('../config/keys');
const async = require('async');


// Prices Page
router.get('/prices/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // async - perform queries in parallel
        async.parallel({
          route: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}&filter[include]=place&filter[include][service][base]=place`)
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
          routePrices: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}/routePrices?access_token=${req.session.serverAccessToken}&filter[include]=paxType`)
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
            console.log(error);
          }
          else {
            res.render('dashboard', {
              dashboardLink: true,
              routePricesActive: true,
              companyID: req.session.companyID,
              route: results.route,
              routePrices: results.routePrices
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


// Prices Add Page
router.get('/prices/:id/add',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // async - perform queries in parallel
        async.parallel({
          route: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}&filter[include]=place&filter[include][service][base]=place`)
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
          paxTypes: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?&access_token=${req.session.serverAccessToken}`)
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
              routePricesAddActive: true,
              companyID: req.session.companyID,
              route: results.route,
              paxTypes: results.paxTypes
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


// Prices Edit Page
router.get('/prices/:id/edit',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // async - perform queries in parallel
        async.parallel({
          route: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}&filter[include]=place&filter[include][service][base]=place`)
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
          paxPrices: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}/routePrices?access_token=${req.session.serverAccessToken}&filter[include]=paxType`)
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
          paxTypes: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?&access_token=${req.session.serverAccessToken}`)
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
              routePricesEditActive: true,
              companyID: req.session.companyID,
              route: results.route,
              paxPrices: results.paxPrices,
              paxTypes: results.paxTypes
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


// Route Price Create
router.post('/prices/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        //console.log(req.body);
        // Set Variables
        let errors = [];
        let paxPrices = [];
        let price;

        // Get all paxTypes to make sure each one was submitted
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?access_token=${req.session.serverAccessToken}`)
          .then(paxTypes => {
            // for each PaxType
            async.each(paxTypes.data,
              // function for each paxType
              (paxType, callback) => {
                //console.log(paxType);
                price = parseInt(req.body[paxType.id]).replace(/<(?:.|\n)*?>/gm, '');
                if (!price > 0) {
                  errors.push({ text: `Missing price for Age Group: ${paxType.name}` });
                }
                paxPrices.push({ "paxTypeId": paxType.id, "price": price })
                callback();
              },
              // after all loops are complete...
              err => {
                // All tasks are done now
                if (err) {
                  //console.log(err);
                  res.render('index/errorPage', {
                    error: error
                  })
                }
                else {
                  // If erors, stop and display them, or else send post to update prices.
                  if (errors.length > 0) {
                    // async - perform queries in parallel
                    async.parallel({
                      route: callback => {
                        axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}&filter[include]=place&filter[include][service][base]=place`)
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
                      paxTypes: callback => {
                        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?&access_token=${req.session.serverAccessToken}`)
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
                        //console.log(paxPrices);
                        res.render('dashboard', {
                          dashboardLink: true,
                          routePricesAddActive: true,
                          companyID: req.session.companyID,
                          route: results.route,
                          paxTypes: results.paxTypes,
                          paxPrices,
                          errors
                        })
                      }
                    });
                  }
                  // Make POST request to insert prices
                  else {
                    // Add each POST request to an array, to be performed asynchronously
                    let asyncTasks = []
                    paxPrices.forEach(paxPrice => {
                      asyncTasks.push(callback => {
                        axios.post(`${keys.sassTransferServiceAPIURI}/api/RoutePrices?&access_token=${req.session.serverAccessToken}`, {
                          paxTypeId: paxPrice.paxTypeId,
                          price: paxPrice.price,
                          routeId: req.params.id,
                          companyId: req.session.companyID
                        })
                          .then(response => {
                            callback(null, response.data);
                          })
                          .catch(error => {
                            //console.log(error)
                            res.render('index/errorPage', {
                              error: error
                            })
                          });
                      })
                    });

                    // Perform queries in async
                    async.parallel(asyncTasks, (error, results) => {
                      if (error) {
                        //console.log(error);
                        res.render('index/errorPage', {
                          error: error
                        })
                      }
                      else {
                        // Redirect to Route Prices page
                        // async - perform queries in parallel
                        async.parallel({
                          route: callback => {
                            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}&filter[include][service]=base`)
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
                          routePrices: callback => {
                            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}/routePrices?access_token=${req.session.serverAccessToken}&filter[include]=paxType`)
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
                              routePricesActive: true,
                              companyID: req.session.companyID,
                              route: results.route,
                              routePrices: results.routePrices
                            })
                          }
                        });
                      }
                    })
                  }
                }
              }
            );

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
  })


// Route Price Update
router.post('/prices/:id/edit',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        //console.log(req.body);
        // Set Variables
        let errors = [];
        let paxPrices = [];
        let price;

        // Get all paxTypes to make sure each one was submitted
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?access_token=${req.session.serverAccessToken}`)
          .then(paxTypes => {
            // for each PaxType
            async.each(paxTypes.data,
              // function for each paxType
              (paxType, callback) => {
                //console.log(paxType);
                price = parseInt(req.body[paxType.id]).replace(/<(?:.|\n)*?>/gm, '');
                if (!price > 0) {
                  errors.push({ text: `Missing price for Age Group: ${paxType.name}` });
                }
                paxPrices.push({ "paxTypeId": paxType.id, "price": price })
                callback();
              },
              // after all loops are complete...
              err => {
                // All tasks are done now
                if (err) {
                  //console.log(err);
                  res.render('index/errorPage', {
                    error: error
                  })
                }
                else {
                  // If erors, stop and display them, or else send post to update prices.
                  if (errors.length > 0) {
                    // async - perform queries in parallel
                    async.parallel({
                      route: callback => {
                        axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}&filter[include]=place&filter[include][service][base]=place`)
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
                      paxTypes: callback => {
                        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/paxTypes?&access_token=${req.session.serverAccessToken}`)
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
                        //console.log(paxPrices);
                        res.render('dashboard', {
                          dashboardLink: true,
                          routePricesEditActive: true,
                          companyID: req.session.companyID,
                          route: results.route,
                          paxTypes: results.paxTypes,
                          paxPrices,
                          errors
                        })
                      }
                    });
                  }
                  // Make POST request to Update prices
                  else {

                    axios.delete(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}/routePrices?access_token=${req.session.serverAccessToken}`)
                      .then(() => {
                        // Add each POST request to an array, to be performed asynchronously
                        let asyncTasks = []
                        paxPrices.forEach(paxPrice => {
                          asyncTasks.push(callback => {
                            axios.post(`${keys.sassTransferServiceAPIURI}/api/RoutePrices?&access_token=${req.session.serverAccessToken}`, {
                              paxTypeId: paxPrice.paxTypeId,
                              price: paxPrice.price,
                              routeId: req.params.id,
                              companyId: req.session.companyID
                            })
                              .then(response => {
                                callback(null, response.data);
                              })
                              .catch(error => {
                                //console.log(error)
                                res.render('index/errorPage', {
                                  error: error
                                })
                              });
                          })
                        });

                        // Perform queries in async
                        async.parallel(asyncTasks, (error, results) => {
                          if (error) {
                            //console.log(error);
                            res.render('index/errorPage', {
                              error: error
                            })
                          }
                          else {
                            // Redirect to Route Prices page
                            // async - perform queries in parallel
                            async.parallel({
                              route: callback => {
                                axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}&filter[include][service]=base`)
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
                              routePrices: callback => {
                                axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}/routePrices?access_token=${req.session.serverAccessToken}&filter[include]=paxType`)
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
                                  routePricesActive: true,
                                  companyID: req.session.companyID,
                                  route: results.route,
                                  routePrices: results.routePrices
                                })
                              }
                            });
                          }
                        })
                      })
                      .catch(error => {
                        //console.log(error)
                        res.render('index/errorPage', {
                          error: error
                        })
                      });
                  }
                }
              }
            );

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
  })

// Routes Index
router.get('/',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {
    // async - perform queries in parallel
    async.parallel({
      routes: callback => {
        axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/routes?access_token=${req.session.serverAccessToken}&filter[include]=place&filter[include][service][base]=place`)
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
    axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include][base]=place`)
    .then(response => {      
      res.render('dashboard', {
        dashboardLink: true,
        routesAddActive: true,
        services: response.data,
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

// Routes - Edit Page
router.get('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // async - perform queries in parallel
        async.parallel({
          route: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}&filter[include]=place`)
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
          services: callback => {
            axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include]=base`)
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
              routesEditActive: true,
              companyID: req.session.companyID,
              services: results.services,
              route: results.route
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

// Route Create
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
    let serviceId = req.body.serviceId.replace(/<(?:.|\n)*?>/gm, '');
    let countyId = req.body.countyId.replace(/<(?:.|\n)*?>/gm, '');
    let countyName = req.body.countyName.replace(/<(?:.|\n)*?>/gm, '');
    let countryCode = 'IE';
    let errors = [];
    
    if (!countyId) {
      errors.push({ text: 'Please select a County.' })
    }
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
          countyId,
          countyName,
          services: response.data,
          dashboardLink: true,
          routesAddActive: true,
          companyID: req.session.companyID
        });
      })
      .catch(errors => {
        //console.log(errors)
        res.render('index/errorPage', {
          error: error
        })  
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
                axios.post(`${keys.sassTransferServiceAPIURI}/api/Routes?&access_token=${req.session.serverAccessToken}`, {
                  name,
                  companyId: req.session.companyID,
                  placeId,
                  serviceId
                })
                  .then(response => {
                    req.flash('success_msg', 'Destination created.')
                    res.redirect('/routes')
                  })
                  .catch(error => {
                    //console.log(error)
                    res.render('index/errorPage', {
                      error: error
                    }) 
                  });
              })
              .catch();
          }
          else {
            let placeId = place[0].id;
            axios.post(`${keys.sassTransferServiceAPIURI}/api/Routes?&access_token=${req.session.serverAccessToken}`, {
              name,
              companyId: req.session.companyID,
              placeId,
              serviceId
            })
              .then(response => {
                req.flash('success_msg', 'Destination created.')
                res.redirect('/routes')
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

// Route Edit 
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // Set Variables
        let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
        let serviceId = req.body.serviceId.replace(/<(?:.|\n)*?>/gm, '');
        let placeId = req.body.placeId.replace(/<(?:.|\n)*?>/gm, '');
        let countyId = req.body.countyId.replace(/<(?:.|\n)*?>/gm, '');
        let countyName = req.body.countyName.replace(/<(?:.|\n)*?>/gm, '');
        let countryCode = 'IE';
        let errors = [];

        if (!name.length > 0) {
          errors.push({ text: 'Destination Name cannot be blank.' });
        }
        if (!serviceId) {
          errors.push({ text: "Please select the Service." });
        }
        if (errors.length > 0) {

          // async - perform queries in parallel
          async.parallel({
            route: callback => {
              axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}&filter[include]=place`)
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
            services: callback => {
              axios.get(`${keys.sassTransferServiceAPIURI}/api/Companies/${req.session.companyID}/services?&access_token=${req.session.serverAccessToken}&filter[include]=base`)
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
                routesEditActive: true,
                companyID: req.session.companyID,
                services: results.services,
                route: results.route,
                errors,
                placeId,
                countyId,
                serviceId
              });
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
                    axios.put(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
                      name,
                      companyId: req.session.companyID,
                      placeId,
                      serviceId
                    })
                      .then(response => {
                        req.flash('success_msg', 'Destination updated.')
                        res.redirect('/routes')
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
                axios.put(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
                  name,
                  companyId: req.session.companyID,
                  placeId,
                  serviceId
                })
                  .then(response => {
                    req.flash('success_msg', 'Destination created.')
                    res.redirect('/routes')
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
      })
    });
    
  })

// Route Delete
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/Routes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
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