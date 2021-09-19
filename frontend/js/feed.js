$(document).ready(function(){

  let url,
   inputVals = new Array(5),
   submitData = {},
   clickedCard,
   // getters used so val isn't stagnant, every time accessed ensures val is up to date with current sessionStorage
   authUser = {
     get id() {
       return sessionStorage.getItem('user_id');
     },
     get name() {
       return sessionStorage.getItem('username');
     }
   }

  // for doc fields to post
  const schemaProperties = ['title', 'descript', 'img_url', 'user_id', 'author'],
    postCont = document.querySelector('#albumOutput');

  $.ajax({
    url: 'config.json',
    type: 'GET',
    dataType: 'json',
    success(configData) {
      url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
      // callback so posts don't try to generate before backend server is connected to
      getPosts();
    },
    error(error) { console.log(error); }
  });

  // validating function for add / edit post, ensures i. user is authenticated and ii. all input fields have content
  const validateMe = () => {
    if (!sessionStorage.getItem('user_id')) {
      alert('Please login to perform this action');
      return false;
    } else {
      return (inputVals.every(x => x));
    }
  };

  // aligns fields with user inputs to create a document to post
  const setFieldsToSend = () => {
    for (let i = 0; i < 5; i++) {
      Object.defineProperty(submitData, schemaProperties[i], {
        value: inputVals[i],
        enumerable: true,
        configurable: true
      });
    }
  };

  // for any post functionality, need to know what specific post is being targeted so this function stores specific post id before rerouting that data to whatever function needs to handle whatever the user wants to do
  const informedModal = () => {
    Array.from(document.querySelectorAll('.interaction-icon')).forEach((btn) => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        // specific post id
        clickedCard = e.target.classList[0];

        if (e.target.classList.contains('comment')) {
          openComments(btn);
        } else if (e.target.classList.contains('like')) {
          likePost(btn);
        } else if (e.target.classList.contains('view')) {
          viewImage(btn);
        }
      }, true);
    });
  };

  // all get requests
  const readRequests = (endpoint, callback) => {
    $.ajax({
      url: endpoint,
      type: 'GET',
      dataType: 'json',
      success(response) {
        callback(response);
      }, error(err) {
        console.log(err);
      }
    });
  };
  // this pattern (with a callback in success) has been used so that most execution flow actually runs in the queue (synchronous funcs become async instead of vice versa) -- this way we can chain promises but without bloated unreadable functions, and still return async data from ajax calls without it being undefined or in the form of an entire jqXHR obj (HTTP whole thing instead of just the response data)

  // all post / patch / delete requests
  const writeRequests = (endpoint, method, data, callback) => {
    $.ajax({
      url: endpoint,
      type: method,
      dataType: 'json',
      data: data,
      success(response) {
        callback(response);
      }, error(err) {
        console.log(err);
      }
    });
  };

  // request all data necessary for generating posts (a promise chain, since we need user data regards to if they've liked posts in the past or not)
  const getPosts = () => {
    // get all posts
    readRequests(`${url}/allPosts`, function(posts) {
      // if user logged in, check if they've liked any of those posts previously
      if (authUser.id) {
         readRequests(`${url}/hasLiked/${authUser.id}`, function(liked) {
          // this backend query is set up to return an array of post ids that user has liked -- but since post ids are objects and not primitive elements, gotta flatten them here so we can check if array contains post id without nested loops in next function
          liked = liked.map((each) => {
            return each = Object.values(each);
          }).flat();
          // time to actually generate posts now we have all necessary data
          genPosts(posts, liked);
        });
      } else {
        // second argument is false since user is not authenticated and thus hasn't liked any posts in the past
        genPosts(posts, false);
      }
    });
  };

  // generate posts (first param: post data, second param: posts previously liked by authenticated user)
  const genPosts = (posts, liked) => {
    let iconClass,
      authEdit;
    postCont.innerHTML = '';
    for (let i = posts.length - 1; i >= posts.length - 20; i -= 1) {
      // the html below accesses post array element heapss of times, so it's more performant to store that element in a const here (same with author, which is user doc)
      const item = posts[i],
        author = posts[i].author[0];
      // change post like state if user has liked post in past
      if (liked && liked.includes(item._id)) {
        iconClass = 'fa-heart active-icon';
      } else {
        iconClass = 'fa-heart-o';
      }
      // change post functionality (edit / delete) icons to show if user is author of post
      if (authUser.id !== item.user_id) {
        authEdit = 'display-none';
      } else {
        authEdit = '';
      }
      postCont.innerHTML += `<div class="col-md-4">
        <div class="card mb-4">
          <img class="card-img-top" src="${item.img_url}" alt="" style="width: 100%">
          <div class="card-img-overlay d-flex">
            <div class="expand-container text-wrap">
              <i class="${item._id} interaction-icon view fa fa-expand" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#viewFullImageModal"></i>
            </div>
            <div class="col-8 overlay-container d-flex justify-content-center">
              <img class="rounded-circle overlay-profile-image" src="${author.profl_pic}" alt="" width="50" height="50">
              <div class="overlay-text-container">
                <h4 class="overlay-username d-block">${author.username}</h4>
                <p class="overlay-imagename d-block">${item.title}</p>
              </div>
            </div>
          </div>
          <div class="card-body">
            <div class="like-comment-container d-flex justify-content-between">
              <p class="${item._id} like interaction-icon like-counter interaction-icon"><i class="${item._id} fa ${iconClass} like" aria-hidden="true"></i> ${item.stats.likes.length}</p>
              <p class="${item._id} comment interaction-icon comment-counter interaction-icon"><i class="${item._id} comment fa fa-commenting-o" aria-hidden="true"></i> ${item.stats.comments}</p>
              <p class="${item._id} ${authEdit} edit interaction-icon"><i class="${item._id} edit fa fa-pencil" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#editModal"></i></p>
              <p class="${item._id} ${authEdit} delete interaction-icon"><i class="${item._id} delete fa fa-trash-o" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#deleteModal""></i></p>
            </div>
            <p class="card-text">${item.descript}</p>
            <div class="comments-container">
              <div class="comments-themselves"></div>
              <div class="comment-field"></div>
            </div>
          </div>
        </div>
      </div>`;  }
    informedModal();
  };

  // like post function (param from informedModal)
  const likePost = (icon) => {
    // first conditional: user authentication
    if (authUser.id) {
      // second conditional: unlike if already liked or like if not
      if (icon.firstChild.classList.contains('active-icon')) {
        unlikePost(icon);
      } else {
        writeRequests(`${url}/likePost/${clickedCard}`, 'POST', {
          user_id: authUser.id
        }, function() {
          const inc = parseInt(icon.textContent) + 1;
          icon.innerHTML = `<p class="${clickedCard} like interaction-icon like-counter interaction-icon"><i class="${clickedCard} fa fa-heart active-icon like" aria-hidden="true"></i> ${inc}</p>`;
        });
      }
    } else {
      alert('Please login or register to interact with posts :)');
    }
  };

  // unlike post function
  const unlikePost = (icon) => {
    writeRequests(`${url}/unlikePost/${clickedCard}`, 'POST', {
      user_id: authUser.id
    }, function() {
      const inc = parseInt(icon.textContent) - 1;
      icon.innerHTML = `<p class="${clickedCard} like interaction-icon like-counter interaction-icon"><i class="${clickedCard} fa fa-heart-o like" aria-hidden="true"></i> ${inc}</p>`;
    });
  };

  // post comment function (first param: send comment button which contains specific post id, second param: the comments open button which is a reference point for html changes / targets in openComments function, which needs to be a callback here in order to actually show the new comment once posted)
  const postComment = (sendBtn, postRef) => {
    if (authUser.id) {
      writeRequests(`${url}/createComment`, 'POST', {
        author:authUser.name,
        text: document.querySelector('#newComment').value,
        user_id: authUser.id,
        post_id: sendBtn.classList[0]
      }, function() {
        openComments(postRef);
      });
    } else {
      alert('Please login or register to interact with posts :)');
    }
  };

  // open / show comments (param from informedModal)
  const openComments = (icon) => {
    const commentCont = icon.parentElement.parentElement.lastElementChild;
    readRequests(`${url}/seeComments/${clickedCard}`, function(comments) {
      commentCont.firstElementChild.innerHTML = '';
      for (let i = 0; i < comments.length - 1; i++) {
        const item = comments[i];
        commentCont.firstElementChild.innerHTML += `
        <div class="${item._id} comment-output border-bottom">
          <a href="/myprofle#${item.user_id}"<h6 class="comment-username">${item.author}</h6></a>
          <p class="comment-text">${item.text}</p>
          <p class="comment-time">${item.time}</p>
        </div>`
      }
      // don't want nor need to add text field for new comment more than once
      if (!commentCont.lastElementChild.innerHTML) {
        commentCont.lastElementChild.innerHTML = `<div class="form-group mb-3" style="z-index: 1"> <label for="newComment" class="form-label new-comment-label"> <h6>Post New Comment</h6> </label>
          <textarea class="form-control" id="newComment" rows="3" maxlength="160" placeholder="Maximum 160 Characters"></textarea>
          <p class="${clickedCard} post-comment text-end send-comment-btn"><i class="${clickedCard} fa fa-paper-plane text-end" aria-hidden="true"></i></p>
        </div>`;

        // add post comment functionality to send comment icon generated here
        document.querySelector('.post-comment')
          .addEventListener('click', function(e) {
            postComment(e.target, icon);
          }, true);
      }
    });
  };

  document.querySelector('#addPostBtn').addEventListener('click', function(e) {
    Array.from(document.querySelectorAll('.addField')).forEach((inputField, index) => {
      inputVals[index] = $(inputField).val();
    });
    inputVals[3] = sessionStorage.getItem('user_id');
    inputVals[4] = sessionStorage.getItem('username');
    setFieldsToSend();
    if (validateMe()) {
      writeRequests(`${url}/postPost`, 'POST', JSON.stringify(submitData), function(response) {
        if (response) {
          alert('Your project has been successfully added!');
          window.location.reload();
        } else {
          alert('You are not authorised to perform this action');
        }
      });
    } else {
      alert('Please fill out all fields');
      return;
    }
  }, false);

  document.querySelector('#editConfirmBtn').addEventListener('click', function(e) {
    Array.from(document.querySelectorAll('.editField')).forEach((inputField, index) => {
      inputVals[index] = $(inputField).val();
    });
    setFieldsToSend();
    if (validateMe()) {
      writeRequests(`${url}/editPost/${clickedCard}`, 'PATCH', JSON.stringify(submitData), function(response) {
        if (response == '401: user has no permission to update') {
          alert(response);
        } else {
          alert('Post has been updated');
          window.location.reload();
        }
      });
    } else {
      alert('Please fill in all fields');
      return;
    }
  }, false);

  document.querySelector('#deleteConfirmBtn').addEventListener('click', function(e) {
    const user = sessionStorage.getItem('user_id');
    if (!user) {
      alert('You do not have permission to delete this post');
      return;
    }
    writeRequests(`${url}/deletePost/${clickedCard}`, 'DELETE', {
      user_id: user
    }, function(response) {
        if (response == 'deleted') {
          alert('Post has been deleted');
          window.location.reload();
        } else {
          alert('Post was not found');
        }
    });
  }, false);

  const viewImage = (post) => {
     document.querySelector('.fullImage').src = post.parentElement.parentElement.parentElement.firstElementChild.src;
     document.querySelector('.view-title').innerHTML = post.parentElement.nextElementSibling.lastElementChild.lastElementChild.innerText;
  };

});
