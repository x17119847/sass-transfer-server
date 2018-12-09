const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  googleID: {
    type: String,
    required: false
  },
  email: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: false
  },
  lastName: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  }
});

// Create Collection and add schema
mongoose.model('users', UserSchema);