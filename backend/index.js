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

// ---------- set up ----------

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

// ---------- set up ENDS ----------

// ---------- post things (not HTTP post like post post) ----------

app.post('/postPost', (req, res) => {
  const newPost = new Post({
    _id: new mongoose.Types.ObjectId,
    author: req.body.username,
    title: req.body.title,
    descript: req.body.descript,
    img_url: req.body.image_url,
    stats: {
      likes: [],
      comments: 0
    }
    user_id: req.body.user_id
  });
  newPost.save()
    .then(result => {
      User.updateOne({
          _id: req.body.user_id
        },
        {
          $inc: { 'stats.posts': 1 }
        }
      ).then(result => {
        res.send(result);
      }).catch(err => {
        res.send(err);
      })
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

app.patch('/editPost', (req, res) => {
  // gotta do the find first so can verify user is editing own project (another secondary check)
  Post.findById(req.body.post_id, (err, post) => {
    if (post['user_id'] == req.body.user_id) {
      const upd8Post = {
        author: req.body.author,
        title: req.body.title,
        descript: req.body.descript,
        img_url: req.body.img_url
        // unsure if stats needs to be in this or can remain unedited from just leaving it out, hope so
      };
      Post.updateOne({
        _id: req.body.post_id
      }, editedPost)
        .then(result => {
          res.send(result);
        }).catch(err => {
          res.send(err);
        });
    } else {
      res.send('project not found');
    }
  });
});

// ---------- post things END ----------

// ---------- likes ----------

app.post('/likePost', (req, res) => {
  Post.updateOne({
      _id: req.params.id
    },
    {
      // addToSet > push since add only adds user if user not alr in arr, just a secondary check so user can't like twice
      $addToSet: { 'stats.likes': req.body.user_id }
    }
  ).then(post => {
    User.updateOne({
        // user who gets likes stats +1 isn't the user who liked the post, but the user of the post author (if this doesn't work, follow deleteComment pattern (err, post)). also on beulla's, targets fields like: doc['field'] so that might work? or b synonymous not sure yet
        _id: post.user_id
      },
      {
        $inc: { 'stats.likes': 1 }
      }
    ).then(result => {
      // remember 2 upd8 html content to reflect new like
      res.send(result);
    }).catch(err => {
      res.send(err);
    });
  }).catch(err => {
    res.send(err);
  });
});

app.post('/unlikePost', (req, res) => {
  Post.updateOne({
      _id: req.params.id
    },
    {
      // i do wonder if syntax a bit off here since likes maybe nested nested object? prolly not but if buggy may b this
      $pull: { 'stats.likes': req.body.user_id }
    }
  ).then(post => {
    User.updateOne({
        // user who gets likes stats +1 isn't the user who liked the post, but the user of the post author (if this doesn't work, follow deleteComment pattern (err, post))
        _id: post.user_id
      },
      {
        $inc: { 'stats.likes': -1 }
      }
    ).then(result => {
      // remember 2 upd8 html content to reflect new like
      res.send(result);
    }).catch(err => {
      res.send(err);
    });
  }).catch(err => {
    res.send(err);
  });
});

// ---------- likes END ----------

// ---------- comments ----------

app.post('/createComment', (req, res) => {
  const newComment = new Comment({
    _id: new mongoose.Types.ObjectId,
    author: req.body.username,
    text: req.body.text,
    time: new Date(),
    user_id: req.body.user_id,
    post_id: req.body.post_id
  });
  // both .save + .update are promises (necessarily)! and those are scary. but promises inside promises, need 1 (one) result ever sent, and catch errors on everything that can go wrong. funky, bc i would've worried that first result of save wouldn't have properly gone through, and while second result of upd8 is one that http response responds with, both seem to have been passed to mongo
  newComment.save()
    .then(result => {
      Post.updateOne({
          _id: req.body.post_id
        },
        {
          $inc: { 'stats.comments': 1 }
        }
      ).then(result => {
        res.send(result);
      }).catch(err => {
        res.send(err);
      });
    }).catch(err => {
      res.send(err);
    });
});

app.get('/seeComments/:id', (req, res) => {
  Comment.find({
    post_id: req.params.id
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

app.delete('/deleteComment/:id', (req, res) => {
  Comment.findOne({
    _id: req.params.id
  }, (err, comment) => {
    if (comment && comment['user_id'] == req.body.user_id) {
      Post.updateOne({
          _id: comment.post_id
        },
        {
          $inc: { 'stats.comments': -1 }
        }
      ).then(result => {
        Comment.deleteOne({
          _id: req.params.id
          // i rly dk why beulla had err here? implies it's the catch when that can;t be right
        }, err => {
          res.send('deleted');
        });
      }).catch(err => {
        res.send(err);
      });
    } else {
      res.send('not found / unauthorised');
    }
  });
});

// ---------- comments END ----------

// ---------- users login etc ----------

app.post('/newUser', (req, res) => {
  User.findOne({
    username: req.body.username,
  }, (err, userExists) => {
    if (userExists) {
      res.send('username already taken. pls use a different username.');
    } else {
      const hash = bcrypt.hashSync(req.body.password);
      const newUser = new User({
        _id: new mongoose.Types.ObjectId,
        username: req.body.username,
        profl_pic: req.body.email,
        password: hash,
        email: req.body.email,
        acc_type: false,
        stats: {
          posts: 0,
          likes: 0
        }
      });
      newUser.save()
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
    username: req.body.username
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

// ---------- users END ----------
