const express = require('express');
const router = express.Router();
const { ensureAuthenticated, authenticateServer } = require('../helpers/auth');
const axios = require('axios');
const keys = require('../config/keys');

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
    .catch(error => {
      //console.log(error)
      res.render('index/errorPage', {
        error: error
      }) 
    });
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
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        res.render('dashboard', {
          dashboardLink: true,
          paxTypesEditActive: true,
          companyID: req.session.companyID,
          paxType: response.data
        })
      }
    })
    .catch(error => {
      //console.log(error)
      res.render('index/errorPage', {
        error: error
      })
    });
});

// Create Pax Type
router.post('/', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    // Set Variables
    let age_from = parseInt(req.body.age_from).replace(/<(?:.|\n)*?>/gm, '');
    let age_to = parseInt(req.body.age_to).replace(/<(?:.|\n)*?>/gm, '');
    let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
    let errors = [];

    if (!name.length > 0) {
      errors.push({text:'Name cannot be blank.'})
    }
    if(!age_to > 0) {
      errors.push({ text:'Age To must be more than zero.'})
    }
    if(age_from >= age_to) {
      errors.push({ text:'Age From must be less than Age To'})
    }
    if(errors.length > 0) {
      res.render('dashboard', {
        errors,
        age_from,
        age_to,
        name,
        dashboardLink: true,
        paxTypesAddActive: true,
        companyID: req.session.companyID
      });
    }
    else {
      // Send Post Request to API Server
      axios.post(`${keys.sassTransferServiceAPIURI}/api/PaxTypes?&access_token=${req.session.serverAccessToken}`, {
        age_from,
        age_to,
        name,
        companyId: req.session.companyID
      })
        .then(response => {      
          req.flash('success_msg','Pax Type created.')
          res.redirect('/pax-types')
        })
        .catch(error => {
          //console.log(error);
          res.render('index/errorPage', {
            error: error
          })
        })
    
    }
})

// Edit Pax Type
router.post('/edit/:id',
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
        // Set Variables
        let age_from = parseInt(req.body.age_from).replace(/<(?:.|\n)*?>/gm, '');
        let age_to = parseInt(req.body.age_to).replace(/<(?:.|\n)*?>/gm, '');
        let name = req.body.name.trim().replace(/<(?:.|\n)*?>/gm, '');
        let errors = [];

        if (!name.length > 0) {
          errors.push({ text: 'Name cannot be blank.' })
        }
        if (!age_to > 0) {
          errors.push({ text: 'Age To must be more than zero.' })
        }
        if (age_from >= age_to) {
          errors.push({ text: 'Age From must be less than Age To' })
        }

        if (errors.length > 0) {
          axios.get(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`)
            .then(response => {
              res.render('dashboard', {
                dashboardLink: true,
                paxTypesEditActive: true,
                companyID: req.session.companyID,
                paxType: response.data,
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
          axios.put(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?&access_token=${req.session.serverAccessToken}`, {
            age_from,
            age_to,
            name,
            companyId: req.session.companyID
          })
            .then(response => {
              req.flash('success_msg', 'Pax Type updated.')
              res.redirect('/pax-types')
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

// Delete Pax Type
router.get('/delete/:id', 
  authenticateServer,
  ensureAuthenticated,
  (req, res) => {

    axios.get(`${keys.sassTransferServiceAPIURI}/api/PaxTypes/${req.params.id}?access_token=${req.session.serverAccessToken}`)
    .then(response => {
      // Check that the resouce belongs to the user requesting it
      if (response.data.companyId != req.session.companyID) {
        req.flash('error_msg', 'Unauthorized');
        res.redirect('/dashboard');
      }
      else {
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