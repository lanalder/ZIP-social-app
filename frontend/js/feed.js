$(document).ready(function(){

  let url,
  // to be populated with user input values when adding / editing projects
   inputVals = new Array(6),
   // the object to be sent in HTTP request, populated by values of array above (these two aren't just the same object as it's easier to have an array when validating values & aligning them with DOM input fields)
   submitData = {},
   clickedCard;

   // outline for key names for request's body, adhering to db schema
  const schemaProperties = ['title', 'descript', 'img_url', 'user_id', 'author'];

  // --------------- initialise backend ---------------

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


  // --------------- backend initialisation ENDS ---------------

  // --------------- helper functions ---------------

  // ensure user is logged in and has filled out every input field
  const validateMe = () => {
    // if not logged in, get wrecked
    if (!sessionStorage.getItem('user_id')) {
      alert('Please login to perform this action');
      return false;

      // return boolean based on if every input field has been filled out
    } else {
      return (inputVals.every(x => x));
    }
  };

  // pair user inputs / user account / project id and make a nice little object which we can send in our requests
  const setFieldsToSend = () => {
    // return data object which aligns user inputs and schema properties so that the db stores things as it should
    for (let i = 0; i < 6; i++) {
      Object.defineProperty(submitData, schemaProperties[i], {
        value: inputVals[i],
        // enumerable = iterable, necessary for json.stringify, that it doesn't default to true is prolly why Object.methods r so dangerous but anyway
        enumerable: true,
        // ugh same with configurable, i've learnt my lesson and will listen 2 best practices next time
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
        } // else if edit etc.

      }, false);
    });
  };

  // --------------- helper functions END ---------------

  // --------------- misc for now  ---------------

  const openComments = (postClicked) => {
    console.log(postClicked);
    $.ajax({
      url: `${url}/seeComments/${clickedCard}`,
      type: 'GET',
      dataType: 'json',
      // lollll it works tho
      context: postClicked.parentElement.parentElement.parentElement,
      success(comments) {

        // not decrementing loop bc we can sort comments by date in backend
        for (let i = 0; i < comments.length; i++) {
          const item = comments[i];

          this.innerHTML += `
          <div class="comment-container border-bottom">
            <h6 class="comment-username">${item.author}</h6>
            <p class="comment-text">${item.text}</p>
            <p class="comment-time">${item.time}</p>
          </div>`
        } // end of loop

        this.innerHTML += `
        <div class="form-group mb-3">
          <label for="newComment" class="form-label new-comment-label">
            <h6>Post New Comment</h6>
          </label>
          <textarea class="form-control" id="newComment" rows="3" maxlength="160" placeholder="Maximum 160 Characters"></textarea>
          <p class="text-end send-comment-btn"><i class="fa fa-paper-plane text-end" aria-hidden="true"></i></p>
        </div>`
      },
      error(error) { console.log(error); }
    });
  };

  const likes = (postClicked) => {
    if (sessionStorage.getItem('user_id')) {
      $.ajax({
        url: `${url}/likePost/${clickedCard}`,
        type: 'POST',
        data: {
          user_id: sessionStorage.getItem('user_id')
        },
        // i found out today that dataType refers to the response & not the request, so when we say json here it auto passes response object through json parser
        dataType: 'json'
      }).done(cool => {
        console.log(cool);
        // upd8 HTML here
      });
    } else {
      alert('Please login or register to interact with posts :)');
    }
  };

  const cards = () => {
    $.ajax({
      url: `${url}/allPosts`,
      type: 'GET',
      dataType: 'json',
      context: document.querySelector('#albumOutput'),
      success(posts) {

        this.innerHTML = '';

        for (let i = posts.length - 1; i >= 0; i -= 1) {

          const item = posts[i];
            this.innerHTML += `<div class="col-md-4">
              <div class="card mb-4">
                <img class="card-img-top" src="${item.img_url}" alt="" style="width: 100%">
                <div class="card-img-overlay d-flex">
                  <div class="expand-container text-wrap">
                    <i class="${item._id} fa fa-expand" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#viewFullImageModal"></i>
                  </div>
                  <div class="col-8 overlay-container d-flex justify-content-center">
                    <img class="rounded-circle overlay-profile-image" src="${item.author[0].profl_pic}" alt="" width="50" height="50">
                    <div class="overlay-text-container">
                      <h4 class="overlay-username d-block">${item.author[0].username}</h4>
                      <p class="overlay-imagename d-block">${item.title}</p>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="like-comment-container d-flex justify-content-between">

                    <p class="${item._id} like interaction-icon like-counter interaction-icon"><i class="${item._id} fa fa-heart-o like" aria-hidden="true"></i> ${item.stats.likes.length}</p>

                    <p class="${item._id} comment interaction-icon comment-counter interaction-icon"><i class="${item._id} comment fa fa-commenting-o" aria-hidden="true"></i> ${item.stats.comments}</p>

                    <p class="${item._id} edit interaction-icon"><i class="${item._id} edit fa fa-pencil" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#editModal"></i></p>

                    <p class="${item._id} delete interaction-icon"><i class="${item._id} delete fa fa-trash-o" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#deleteModal"></i></p>

                  </div>
                  <p class="card-text">${item.descript}</p>
                  <div class="comments-output">
                  </div>
                </div>
              </div>
            </div>`;
        } // end of loop
        informedModal();
      }
    })
  };

  // --------------- misc ENDS  ---------------

  // // --------------- add project ---------------
  //
  // document.querySelector('#addPostBtn').addEventListener('click', function(e) {
  //
  //   // inp fields stored in an array
  //   Array.from(document.querySelectorAll('.add')).forEach((inputField, index) => {
  //     inputVals[index] = $(inputField).val();
  //   });
  //
  //   // array nicely aligned to schema keys so it resembles a proper db object
  //   setFieldsToSend();
  //   console.log(submitData);
  //
  //   if (validateMe()) {
  //     $.ajax({
  //       url: `${url}/postPost`,
  //       type: 'POST',
  //       data: JSON.stringify(submitData),
  //       contentType: 'application/json',
  //       success(project) {
  //         alert('Your project has been successfully added!');
  //         window.location.reload();
  //       },
  //       error(error) {
  //         alert('You are not authorised to perform this action');
  //       }
  //     });
  //
  //   } else {
  //     alert('Please fill out all fields');
  //     return;
  //   }
  // }, false);
  //
  // // --------------- add project ENDS ---------------
  //
  // // --------------- edit project ---------------
  //
  // document.querySelector('#editConfirmBtn').addEventListener('click', function(e) {
  //
  //   // same deal
  //   Array.from(document.querySelectorAll('.edit')).forEach((inputField, index) => {
  //     inputVals[index] = $(inputField).val();
  //   });
  //
  //   setFieldsToSend();
  //
  //   if (validateMe()) {
  //     $.ajax({
  //       url: `${url}/editPost/${clickedCard}`,
  //       type: 'PATCH',
  //       data: JSON.stringify(submitData),
  //       contentType: 'application/json',
  //       success(data) {
  //         if (data == '401: user has no permission to update') {
  //           alert(data);
  //         } else {
  //           alert('Post has been updated');
  //           window.location.reload();
  //         }
  //       },
  //       error() {
  //         console.log('error: cannot call api');
  //       }
  //     });
  //
  //   } else {
  //     alert('Please fill in all fields');
  //     return;
  //   }
  // }, false);
  //
  // // --------------- delete project ---------------
  //
  // document.querySelector('#deleteConfirmBtn').addEventListener('click', function(e) {
  //
  //   // can't delete if not logged in
  //   if (!sessionStorage.getItem('user_id')) {
  //     alert('permission denied');
  //     return;
  //   }
  //
  //   $.ajax({
  //     url: `${url}/deletePost/${clickedCard}`,
  //     type: 'DELETE',
  //     data: {
  //       user_id: sessionStorage.getItem('user_id')
  //     },
  //     success(data) {
  //       if (data == 'deleted') {
  //         alert('Post has been deleted');
  //         window.location.reload();
  //       } else {
  //         console.log('Post was not found');
  //       }
  //     },
  //     error() {
  //       console.log('error: cannot call api');
  //     }
  //   });
  // }, false);
  //
  // // --------------- delete project ENDS ---------------
  //
  // // --------------- view project ---------------
  //
  // const viewProject = () => {
  //   $.ajax({
  //     url: `${url}/onePost/${clickedCard}`,
  //     type: 'GET',
  //     dataType: 'json',
  //     success(item) {
  //       // but href / img src needs its own thing
  //       document.querySelector('.fullImage').src = item.img_url;
  //       document.querySelector('.view-title').innerHTML = item.title;
  //     },
  //     error() {
  //       console.log('server error');
  //     }
  //   });
  // };
  //
  // // --------------- view project ENDS ---------------


});
