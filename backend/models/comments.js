const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectID,
  author: String,
  text: String,
  time: Date,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }
});

module.exports = mongoose.model('Comment', commentSchema);
