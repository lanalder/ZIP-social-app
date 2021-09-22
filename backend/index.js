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
  port = 8080,
  ObjectId = mongoose.Types.ObjectId;

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
    author: '',
    title: req.body.title,
    descript: req.body.descript,
    img_url: req.body.img_url,
    stats: {
      likes: [],
      comments: 0
    },
    user_id: req.body.user_id
  });
  newPost.save()
    .then(result => {
      console.log(newPost);
      // User.updateOne({
      //     _id: req.body.user_id
      //   },
      //   {
      //     $inc: { 'stats.posts': 1 }
      //   }
      // ).then(result => {
        console.log(result);
        res.send(result);
      // }).catch(err => {
      //   res.send(err);
      // })
    })
    .catch(err => {
      res.send(err);
    });
});

app.get('/allPosts', (req, res) => {
  Post.aggregate([
    { $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'author'
      }
    // },
    // { $lookup: {
    //     from: 'comments',
    //     localField: 'post_id',
    //     foreignField: '_id',
    //     as: 'stats.comments'
    //   }
    }
  ]).then(result => {
    // console.log(result);
    res.send(result);
  }).catch(err => {
    // console.log(err);
    res.send(err);
  });
});

app.get('/userPosts/:id', (req, res) => {
  Post.aggregate([
    { $match:
      { user_id: ObjectId(req.params.id) }
    },
    { $lookup:
      {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'author'
      }
    }
  ]).then(result => {
    res.send(result);
  }).catch(err => {
    res.send(err);
  });
});

app.post('/likePost/:id', (req, res) => {
  Post.updateOne(
    { _id: req.params.id },
    { $addToSet:
      { 'stats.likes': req.body.user_id }
    },
    (err, post) => {
      User.updateOne(
        { _id: post.user_id },
        { $inc:
          { 'stats.like': 1 }
        },
        (err, done) => {
          if (done) {
            res.send(done);
          } else {
            res.send(err);
          }
        }
      )
    }
  )
});

app.post('/unlikePost/:id', (req, res) => {
  Post.updateOne(
    { _id: req.params.id },
    { $pull:
      { 'stats.likes': req.body.user_id }
    },
    (err, post) => {
      User.updateOne(
        { _id: post.user_id },
        { $inc:
          { 'stats.like': -1 }
        },
        (err, done) => {
          if (done) {
            res.send(done);
          } else {
            res.send(err);
          }
        }
      )
    }
  )
});

app.get('/hasLiked/:id', (req, res) => {
  User.findOne({
    _id: req.params.id
  }, (err, user) => {
    if (err) {
      console.log(err);
    }
    Post.aggregate([
      { $match:
        { $expr:
          { $in: [ user._id, '$stats.likes' ] }
        }
      },
      { $project:
        { _id: 1 }
      }
    ]).then(result => {
       res.send(result);
     }).catch(err => {
       res.send(err);
     });
  });
});

app.patch('/editPost/:id', (req, res) => {
  Post.findById(req.params.id, (err, post) => {
    if (post.user_id == req.body.user_id) {
      const upd8Post = {
        author: '',
        title: req.body.title,
        descript: req.body.descript,
        img_url: req.body.img_url
      };
      Post.updateOne({
        _id: req.params.id
      }, upd8Post)
        .then(result => {
          console.log(result);
          res.send(result);
        }).catch(err => {
          console.log(err);
          res.send(err);
        });
    } else {
      res.send('project not found');
    }
  });
});

app.delete('/deletePost/:id', (req, res) => {
  Post.findOne({
    _id: req.params.id
  }, (err, post) => {
    if (post && post.user_id == req.body.user_id) {
      Post.deleteOne({
        _id: req.params.id
      }, err => {
        res.send('deleted');
      });
    } else {
        res.send('not found / unauthorised');
    }
  });
});

app.post('/createComment', (req, res) => {
  const newComment = new Comment({
    _id: new mongoose.Types.ObjectId,
    author: req.body.author,
    text: req.body.text,
    time: new Date(),
    user_id: req.body.user_id,
    post_id: req.body.post_id
  });
  newComment.save()
    .then(result => {
      Post.updateOne({
          _id: req.body.post_id
        },
        {
          $inc: { 'stats.comments': 1 }
        }
      ).then(result => {
        // assume that'll work -- can just add that (but a post?)
        res.send(newComment);
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

app.patch('/lz', (req ,res) => {
  // Comment.remove({}).then(result => {res.send(result)}).catch(err => {res.send(err)});
  Comment.find({}, (err, comments) => {
    console.log(comments);
    // comments.stats.comments = 0;
    comments.updateOne({
      'stats.comments': 0
    }).then(result => {res.send(result)}).catch(err=>{res.send(err)});
  }).then(result => {res.send(result)}).catch(err=>{res.send(err)});

});

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

app.get('/getUser/:id', (req, res) => {
  User.findOne({
    _id: req.params.id
  }, (err, user) => {
    if (user) {
      res.send(user);
    }
  })
});

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
        profl_pic: req.body.profl_pic,
        acc_type: 0,
        stats: {
          posts: 0,
          likes: 0
        }
      });
      user.save()
        .then(result => {
          console.log(user, result);
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
