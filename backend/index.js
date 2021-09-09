const express = require('express'),
  app = express();
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  cors = require('cors'),
  bcrypt = require('bcryptjs'),
  config = require('./config.json'),
  Post = require('./models/posts.js'),
  User = require('./models/users.js'),
  Comment = require('./models/comments.js'),
  port = 8080;

// ---------------------------- set up ----------------------------

app.use((req, res, next) => {
  console.log(`${req.method} request ${req.url}`);
  next();
});

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(cors());

app.get('/', (req, res) => res.send('hello from the backend'));

mongoose.connect(`mongodb+srv://${config.MONGO_USER}:${config.MONGO_PASSWORD}@cluster0.${config.MONGO_CLUSTER_NAME}.mongodb.net/ZIP?retryWrites=true&w=majority`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('db connected yeahh');
  })
  .catch(err => {
    console.log(`errorrr oh no DBConnectionError: ${err.message}`);
});

app.listen(port, () => console.log(`Fullstack app is listening on port ${port}`));

// ---------------------------- set up ENDS ----------------------------

app.post('/postPost', (req, res) => {
  const newPost = new Post({
    _id: new mongoose.Types.ObjectId,
    author: req.body.username,
    caption: req.body.caption,
    imgUrl: req.body.imgUrl,
    user_id: req.body.user_id
  });
  newPost.save()
    .then(result => {
      res.send(result);
    })
    .catch(err => {
      res.send(err);
    });
});
