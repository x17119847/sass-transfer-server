// Require the necessary JavaScript Libraries
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

// Load the local database User Model
require('./models/User');

// Passport Configuration
require('./config/passport')(passport);

// Load HTTP Route handlers
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

// Load Custom made NPM Package - Handlebars Helpers NCI
const {
  times,
  isSelected,
  applyValue,
  stripTags
} = require('handlebars-helpers-nci');

// Database connection - Mongoose
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

// Load Body Parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Load Handlebars Middleware as the Template Engine
app.engine('handlebars', exphbs({
  helpers: {
    times,
    isSelected,
    applyValue,
    stripTags
  },
  defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Load Cookie Parser and Express Session Middleware
app.use(cookieParser());
app.use(session({
  secret: 'x17118747',
  resave: false,
  saveUninitialized: false
}))

// Load Passport Middleware into the application
app.use(passport.initialize());
app.use(passport.session());

// Load Flash Middleware - used for displaying messages
app.use(flash());

// Set Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

// Set Static Folder for CSS, JS and images.
app.use(express.static(path.join(__dirname, 'public')));

// Use Routes in the application
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

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})