$(document).ready(function() {

  let url,
    inputVals = new Array(5),
    submitData = {},
    clickedCard;

  const schemaProperties = ['title', 'descript', 'img_url', 'user_id', 'author'];

  $.ajax({
    url: 'config.json',
    type: 'GET',
    dataType: 'json',
    success(configData) {
      url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
      cards();
    },
    error(error) { console.log(error); }
  });

  const validateMe = () => {
    if (!sessionStorage.getItem('user_id')) {
      alert('Please login to perform this action');
      return false;
    } else {
      return (inputVals.every(x => x));
    }
  };

  const setFieldsToSend = () => {
    for (let i = 0; i < 5; i++) {
      Object.defineProperty(submitData, schemaProperties[i], {
        value: inputVals[i],
        enumerable: true,
        configurable: true
      });
    }
  };

  const informedModal = () => {
    Array.from(document.querySelectorAll('.interaction-icon')).forEach((btn) => {
      btn.addEventListener('click', function(e) {
        clickedCard = e.target.classList[0];
        if (e.target.classList.contains('comment')) {
          openComments(btn);
        } else if (e.target.classList.contains('like')) {
          likes(btn);
        } else if (e.target.classList.contains('view')) {
          viewImage(btn);
        }
      }, false);
    });
  };

  const likes = (icon) => {
    if (sessionStorage.getItem('user_id')) {
      $.ajax({
        url: `${url}/likePost/${clickedCard}`,
        type: 'POST',
        data: {
          user_id: sessionStorage.getItem('user_id')
        },
        dataType: 'json'
      }).done(() => {
        icon.firstChild.classList.toggle('fa-heart-o');
        icon.firstChild.classList.toggle('fa-heart');
        icon.firstChild.classList.toggle('active-icon');
      });
    } else {
      alert('Please login or register to interact with posts :)');
    }
  };

  const cards = () => {
    const user = sessionStorage.getItem('user_id');
    let clickedUser = window.location.hash.substring(1);
    if (clickedUser === 'me') {
      clickedUser = user;
    }
    $.ajax({
      url: `${url}/userPosts/${user}`,
      type: 'GET',
      dataType: 'json',
      success(posts) {
        $.ajax({
          url: `${url}/hasLiked/${user}`,
          type: 'GET',
          dataType: 'json',
          context: document.querySelector('#albumOutput'),
          success(liked) {
            document.querySelector('.myprofile-header').textContent = `${posts[0].author[0].username}`;
            document.querySelector('.profile-image').src = `${posts[0].author[0].profl_pic}`;
            // document.querySelector('.')
            let iconClass;
            liked = liked.map((each) => {
              return each = Object.values(each);
            }).flat();
            this.innerHTML = '';
            for (let i = posts.length - 1; i >= 0; i -= 1) {
              const item = posts[i];
              const author = item.author[0];
              if (liked.includes(item._id)) {
                iconClass = 'fa-heart active-icon';
              } else {
                iconClass = 'fa-heart-o';
              }
              this.innerHTML += `<div class="col-md-4">
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
                      <p class="${item._id} edit interaction-icon"><i class="${item._id} edit fa fa-pencil" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#editModal"></i></p>
                      <p class="${item._id} delete interaction-icon"><i class="${item._id} delete fa fa-trash-o" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#deleteModal""></i></p>
                    </div>
                    <p class="card-text">${item.descript}</p>
                    <div class="comments-output">
                    </div>
                  </div>
                </div>
              </div>`;
            }
            informedModal();
          }, error(err) {
            console.log(err);
          }
        });
      }
    });
  };

  const postComment = () => {
    Array.from(document.querySelectorAll('.post-comment')).forEach((btn) => {
      btn.addEventListener('click', function(e) {
        if (sessionStorage.getItem('user_id')) {
          $.ajax({
            url: `${url}/createComment`,
            type: 'POST',
            dataType: 'json',
            data: {
              author: sessionStorage.getItem('username'),
              text: document.querySelector('#newComment').value,
              user_id: sessionStorage.getItem('user_id'),
              post_id: e.target.classList[0]
            },
            complete() {
              openComments(e.target);
            }
          });
        } else {
          alert('Please login or register to interact with posts :)');
        }
      }, false);
    });
  };

  const openComments = (icon) => {
    $.ajax({
      url: `${url}/seeComments/${clickedCard}`,
      type: 'GET',
      dataType: 'json',
      context: icon.parentElement.parentElement.parentElement,
      success(comments) {
        for (let i = 0; i < comments.length; i++) {
          const item = comments[i];
          this.innerHTML += `
          <div class="comment-container border-bottom">
            <a href="/myprofle#${item.user_id}"<h6 class="comment-username">${item.author}</h6></a>
            <p class="comment-text">${item.text}</p>
            <p class="comment-time">${item.time}</p>
          </div>`
        }
        this.innerHTML += `
        <div class="form-group mb-3" style="z-index: 1">
          <label for="newComment" class="form-label new-comment-label">
            <h6>Post New Comment</h6>
          </label>
          <textarea class="form-control" id="newComment" rows="3" maxlength="160" placeholder="Maximum 160 Characters"></textarea>
          <p class="${clickedCard} post-comment text-end send-comment-btn"><i class="${clickedCard} post-comment fa fa-paper-plane text-end" aria-hidden="true"></i></p>
        </div>`
        postComment();
      },
      error(error) { console.log(error); }
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
      $.ajax({
        url: `${url}/postPost`,
        type: 'POST',
        data: JSON.stringify(submitData),
        contentType: 'application/json',
        success(project) {
          alert('Your project has been successfully added!');
          window.location.reload();
        },
        error(error) {
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
      $.ajax({
        url: `${url}/editPost/${clickedCard}`,
        type: 'PATCH',
        data: JSON.stringify(submitData),
        contentType: 'application/json',
        success(data) {
          if (data == '401: user has no permission to update') {
            alert(data);
          } else {
            alert('Post has been updated');
            window.location.reload();
          }
        },
        error() {
          console.log('error: cannot call api');
        }
      });
    } else {
      alert('Please fill in all fields');
      return;
    }
  }, false);

  document.querySelector('#deleteConfirmBtn').addEventListener('click', function(e) {
    if (!sessionStorage.getItem('user_id')) {
      alert('You do not have permission to delete this post');
      return;
    }
    $.ajax({
      url: `${url}/deletePost/${clickedCard}`,
      type: 'DELETE',
      data: {
        user_id: sessionStorage.getItem('user_id')
      },
      success(data) {
        if (data == 'deleted') {
          alert('Post has been deleted');
          window.location.reload();
        } else {
          console.log('Post was not found');
        }
      },
      error() {
        console.log('error: cannot call api');
      }
    });
  }, false);

  const viewImage = (post) => {
     document.querySelector('.fullImage').src = post.parentElement.parentElement.parentElement.firstElementChild.src;
     document.querySelector('.view-title').innerHTML = post.parentElement.nextElementSibling.lastElementChild.lastElementChild.innerText;
  };

});
