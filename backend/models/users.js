const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectID,
  username: String,
  profl_url: String,
  password: String,
  email: String,
  acc_type: String
});

module.exports = mongoose.model('User', userSchema);
