const axios = require('axios');
const keys = require('../config/keys');

module.exports = {

  // Ensure the user is Authenticated
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },

  // Authenticate Server
  authenticateServer: (req, res, next) => {

    // If there are no Session vars for serverUserID or serverAccessToken, then login and next()
    let loginURL = `${keys.sassTransferServiceAPIURI}/api/Users/login`;

    if(req.session.serverUserID == undefined || req.session.serverAccessToken == undefined) {
      console.log('NO SESSION VARS')
      axios.post(loginURL, {
        email: keys.sassTransferServiceAPIEmail,
        password: keys.sassTransferServiceAPIPassword
      })
      .then(function (response) {
        req.session.serverAccessToken = response.data.id;
        req.session.serverUserID = response.data.userId;
        next();
      })
      .catch(function (error) {
        res.send(`Could not authenticate on API Server: ${error}, ${loginURL}`)
      });
    }
    else {
      console.log('have session vars')
      // Check if token is valid
      let checkTokenURL = `${keys.sassTransferServiceAPIURI}/api/Users/${req.session.serverUserID}?access_token=${req.session.serverAccessToken}`;

      axios.get(checkTokenURL)
      .then(response => {
        next();
      })
      .catch(error => {
        // Token is not valid. Perform login to server to obtain token      
        axios.post(loginURL, {
          email: keys.sassTransferServiceAPIEmail,
          password: keys.sassTransferServiceAPIPassword
        })
        .then(function (response) {            
          req.session.serverAccessToken = response.data.id;
          req.session.serverUserID = response.data.userId;
          next();
        })
        .catch(function (error) {
          res.send(`Could not authenticate on API Server: ${error}, ${checkTokenURL}, ${loginURL}`)
        });

      });
    }
  },

  // Validate Web User
  validateWebUser: (req, res, next) => {
    
    let webUserURL = `${keys.sassTransferServiceAPIURI}/api/Companies?filter={"where":{"email":"${req.user.email}"}}&access_token=${req.session.serverAccessToken}`;

    axios.get(webUserURL)
      .then(response => {
        // If empty array, then create Company for web user
        if(response.data.length == 0) {
          
          let newCompanyURL = `${keys.sassTransferServiceAPIURI}/api/Companies?access_token=${req.session.serverAccessToken}`;
          axios.post(newCompanyURL, {
            userId: req.user.id,
            email: req.user.email  
          })
            .then(response => {              
              req.session.companyID = response.data.id;              
              next();
            })
            .catch(error => {
              console.log(error);
            });
        } 
        else {           
          console.log(response.data[0].id)
          req.session.companyID = response.data[0].id;                      
          next();
        }
      })
      .catch(error => {
        console.log(error)
      });
    
  }

}