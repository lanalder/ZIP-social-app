const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectID,
  post_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Posts'
  },
  text: String,
  time: Date
});

module.exports = mongoose.model('Comments', commentSchema);
