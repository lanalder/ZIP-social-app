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

app.post('/postPost', (req, res) => {
  const newPost = new Post({
    _id: new mongoose.Types.ObjectId,
    author: req.body.username,
    caption: req.body.caption,
    likes: 0,
    img_url: req.body.img_url,
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

app.get('/allPosts', (req, res) => {
  Post.find({})
    .then(result => {
      res.send(result);
    }).catch(err => {
      res.send(err);
    });
});

app.post('/createComment', (req, res) => {
  const newComment = new Comment({
    _id: new mongoose.Types.ObjectId,
    author: req.body.username,
    text: req.body.text,
    time: new Date(),
    user_id: req.body.user_id,
    post_id: req.body.post_id
  });
  newComment.save()
    .then(result => {
      res.send(result);
    }).catch(err => {
      res.send(err);
    });
});

app.get('/seeComments/:id', (req, res) => {
  const post = req.params.id;
  Comment.find({
    post_id: post,
  }, (err, comments) => {
    if (comments) {
      res.send(comments);
    } else {
      res.send(err);
    }
  });
});

// app.get('/seeComments/:id', (req, res) => {
//   const post = req.params.id;
//   // Comment.aggregate([
//   //   { $match: { post_id: req.params.id } }
//   // ])
//   Comment.find({
//     post_id: post
//   }).then(result => {
//     res.send(result);
//   }).catch(err => {
//     res.send(err);
//   });
// });

app.post('/newUser', (req, res) => {
  User.findOne({
    username: req.body.username,
  }, (err, userExists) => {
    if (userExists) {
      res.send('username already taken. pls use a different username.');
    } else {
      const hash = bcrypt.hashSync(req.body.password);
      const user = new User({
        _id: new mongoose.Types.ObjectId,
        username: req.body.username,
        password: hash,
        email: req.body.email,
        profl_pic: 'null',
        acc_type: 0,
        stats: {
          posts: 0,
          likes: 0
        }
      });
      user.save()
        .then(result => {
          res.send(result);
        }).catch(err => {
          res.send(err);
        });
    }
  })
});

app.post('/loginUser', (req, res) => {
  User.findOne({
    username: req.body.Username
  }, (err, userExists) => {
    if (userExists) {
      if (bcrypt.compareSync(req.body.password, userExists.password)) {
        res.send(userExists);
      } else {
        res.send('not authorised');
      }
    } else {
      res.send('user not found. please register :)')
    }
  });
});
