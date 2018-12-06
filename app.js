const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const exphbs = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const axios = require('axios');

// Load Models
require('./models/User');


// Passport Config
require('./config/passport')(passport);

// Load Routes
const index = require('./routes/index');
const auth = require('./routes/auth');
const dashboard = require('./routes/dashboard');
const company = require('./routes/company');
const paxTypes = require('./routes/paxTypes');
const drivers = require('./routes/drivers');
const vehicleTypes = require('./routes/vehicleTypes');
const vehicles = require('./routes/vehicles');
const bases = require('./routes/bases');
const services = require('./routes/services');
const routes = require('./routes/routes');

// Load Keys
const keys = require('./config/keys');

// Handlebars Helpers
const {
  formatDate,
  times,
  isSelected,
  applyValue
} = require('./helpers/hbs');

// Mongoose Connect
mongoose.connect(keys.mongoURI, {
  useNewUrlParser: true
})
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch(error => {
    console.log(error);
  })

// Initialize Express App
const app = express();

// Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Handlebars Middleware
app.engine('handlebars', exphbs({
  helpers: {
    formatDate,
    times,
    isSelected,
    applyValue
  },
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Cookie Parser and Express Session Middleware
app.use(cookieParser());
app.use(session({
  secret: 'x17118747',
  resave: false,
  saveUninitialized: false
}))

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash Middleware
app.use(flash());

// Set Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes
app.use('/', index);
app.use('/auth', auth);
app.use('/dashboard', dashboard);
app.use('/company', company);
app.use('/pax-types', paxTypes);
app.use('/drivers', drivers);
app.use('/vehicle-types', vehicleTypes);
app.use('/vehicles', vehicles);
app.use('/bases', bases);
app.use('/services', services);
app.use('/routes', routes);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})