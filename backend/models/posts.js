const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectID,
  author: String,
  caption: String,
  imgUrl: String,
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users'
  }
});

module.exports = mongoose.model('Posts', postSchema);
