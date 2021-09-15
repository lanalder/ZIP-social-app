$(document).ready(function() {

  const commentsIconAndText = document.querySelector('.comment-counter');
  const commentOutput = document.querySelector('.comments-output');
  // Hide/Show toggle of comments
  commentsIconAndText.addEventListener('click', function() {
    commentOutput.classList.toggle('display-none');
  });

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
      // store user account
      inputVals[4] = sessionStorage.getItem('user_id');
      inputVals[5] = sessionStorage.getItem('author');
      // generating cards left as a callback bc we need backend URL to be defined before we try do anything with it
      cards();
    },
    error(error) {
      console.log(error);
    }
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

  // // make sure non-specific modals have project-specific info
  // const informedModal = () => {
  //   // array populated by all the relevant card buttons (view/edit/delete)
  //   Array.from(document.querySelectorAll('#passProjectAlong')).forEach((btn) => {
  //
      // btn.addEventListener('click', function(e) {
      //   // var to hold project id
      //   clickedCard = e.target.classList[0];
  //
  //       // conditional since while edit just needs user input data now we have clickedCard, view needs the whole project object to populate the view modal...
  //       if (e.target.classList.contains('giveUsAGeez')) {
  //         viewProject();
  //
  //       // ...while delete needs (or, an informed and purposeful UX decision meant that) id is shown before the confirm delete button is clicked (the delete function proper as with the others work on modal buttons and this function here is their only chance to get specific about what card we're targeting)
  //       } else if (e.target.classList.contains('getRidOfThat')) {
  //         document.querySelector('.copyPasteID').innerHTML = `Project ID: ${clickedCard}`;
  //       }
  //     }, false);
  //   });
  // };

  // --------------- helper functions END ---------------

  // --------------- generate some cards (projects) ---------------

  const cards = () => {
    $.ajax({
      url: `${url}/allPosts`,
      type: 'GET',
      dataType: 'json',
      success(projects) {
        // clear old cards if any
        document.querySelector('#albumOutput').innerHTML = '';
        // we know what profile was clicked by the hash value at end of URL, minor string manipulation so its format is the same as authorName in db
        const clickedUser = window.location.hash.substring(1)
          .replace(/(-)/, ' ');

        // decremental loop so latest projects first
        for (let i = projects.length - 1; i >= 0; i -= 1) {
          const item = projects[i];
          // Generate Feed Cards
          document.querySelector('#albumOutput').innerHTML += `<div class="col-md-4">
              <div class="card mb-4">
                <img class="card-img-top" src="${item.img_url}" alt="" style="width: 100%">
                <div class="card-img-overlay d-flex">
                  <div class="expand-container text-wrap">
                    <i class="fa fa-expand ${item._id}" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#viewFullImageModal"></i>
                  </div>
                  <div class="col-8 overlay-container d-flex justify-content-center">
                    <img class="rounded-circle overlay-profile-image" src="${user.profl_pic}" alt="" width="50" height="50">
                    <div class="overlay-text-container">
                      <h4 class="overlay-username d-block">${user.username}</h4>
                      <p class="overlay-imagename d-block">${item.title}</p>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <div class="like-comment-container d-flex justify-content-between">
                    <p class="like-counter interaction-icon"><i class="fa fa-heart-o ${item._id}" aria-hidden="true"></i> ${item.stats.likes.length}</p>
                    <p class="comment-counter interaction-icon"><i class="fa fa-commenting-o ${item._id}" aria-hidden="true"></i> ${item.stats.comments}</p>
                    <p class="interaction-icon"><i class="fa fa-pencil ${item._id}" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#editModal"></i></p>
                    <p class="interaction-icon"><i class="fa fa-trash-o ${item._id}" aria-hidden="true" data-bs-toggle="modal" data-bs-target="#deleteModal"></i></p>
                  </div>
                  <p class="card-text">${item.descript}</p>
                  <div class="comments-output display-none">
                    <div class="form-group mb-3">
                      <label for="newComment" class="form-label new-comment-label">
                        <h6>Post New Comment</h6>
                      </label>
                      <textarea class="form-control" id="newComment" rows="3" maxlength="160" placeholder="Maximum 160 Characters"></textarea>
                      <p class="text-end send-comment-btn"><i class="fa fa-paper-plane text-end" aria-hidden="true"></i></p>
                    </div>
                  </div>
                </div>
              </div>
            </div>`;
        } // end of loop
        // using sneaky classes in template literal's html we can pass along project id, so that when we view/edit/delete that project the non-specific modal knows what card we're targeting and can tell the backend that
        // informedModal();
      }, // end of success
      error(error) {
        console.log(error);
      }
    }); // end of ajax
  };

  // --------------- card (project) generation ENDS ---------------

  // --------------- add project ---------------

  document.querySelector('#addPostBtn').addEventListener('click', function(e) {

    // inp fields stored in an array
    Array.from(document.querySelectorAll('.add')).forEach((inputField, index) => {
      inputVals[index] = $(inputField).val();
    });

    // array nicely aligned to schema keys so it resembles a proper db object
    setFieldsToSend();
    console.log(submitData);

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

  // --------------- add project ENDS ---------------

  // --------------- edit project ---------------

  document.querySelector('#editConfirmBtn').addEventListener('click', function(e) {

    // same deal
    Array.from(document.querySelectorAll('.edit')).forEach((inputField, index) => {
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

  // --------------- delete project ---------------

  document.querySelector('#deleteConfirmBtn').addEventListener('click', function(e) {

    // can't delete if not logged in
    if (!sessionStorage.getItem('user_id')) {
      alert('permission denied');
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

  // --------------- delete project ENDS ---------------

  // --------------- view project ---------------

  const viewProject = () => {
    $.ajax({
      url: `${url}/onePost/${clickedCard}`,
      type: 'GET',
      dataType: 'json',
      success(item) {
        // but href / img src needs its own thing
        document.querySelector('.fullImage').src = item.img_url;
        document.querySelector('.view-title').innerHTML = item.title;
      },
      error() {
        console.log('server error');
      }
    });
  };

  // --------------- view project ENDS ---------------

});

//   let url;

//   $.ajax({
//     url: 'config.json',
//     type: 'GET',
//     dataType: 'json',
//     success(configData) {
//       url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
//     },
//     error(error) { console.log(error); }
//   });

//   // ---------- generate cards with post content ----------

//   const cards = () => {
//     // hash param of URI either: #me when clicked on My Profile (user's own profile), or #username when clicked on someone elses, this specifies backend endpoint
//     const clickedUser = window.location.hash.substring(1);

//     if (clickedUser === 'me') {
//       clickedUser === sessionStorage.getItem('username');
//     }

//     $.ajax({
//       url: `${url}/userPosts/${clickedUser}`,
//       type:'GET',
//       dataType: 'json',
//       success(posts) {
//         document.querySelector('.container').innerHTML = '';


//       }
//     });
//   };
