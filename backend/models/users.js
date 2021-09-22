const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  profl_pic: String,
  password: String,
  email: String,
  acc_type: Boolean,
  stats: {
    posts: Number,
    likes: Number
  }
});

module.exports = mongoose.model('User', userSchema);
