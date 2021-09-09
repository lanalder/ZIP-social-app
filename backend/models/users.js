const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectID,
  username: String,
  password: String,
  email: String,
  dpUrl: String
});

module.exports = mongoose.model('Users', userSchema);
