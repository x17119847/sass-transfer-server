module.exports = {

  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  },

  ensureGuest: (req, res, next) => {
    if (req.isAuthenticated()) {
      res.redirect('/dashboard');
    }
    else {
      return next();
    }
  }
}