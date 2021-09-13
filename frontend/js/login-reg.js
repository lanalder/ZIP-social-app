$(document).ready(function() {

  // follows pretty closely the pattern from album.js, more comments there
  let url,
    inputVals = new Array(3),
    submitData = {};

  const schemaProperties = ['email', 'username', 'password'];

  // --------------- initialise path 2 backend ---------------

  $.ajax({
    url: 'config.json',
    type: 'GET',
    dataType: 'json',
    success(configData) {
      url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
      // again just a cb bc idrk how to use promises properly and i'm not even sure if they'd be good here? or like, every listener would have to be chained, which seems a bit silly especially when there's no need for them to chronologically ordered
      listeners();
    },
    error(error) { console.log(error); }
  });

  // --------------- backend initialisation ENDS ---------------

  // --------------- helper functions ---------------

  const setFieldsToSend = (existingUser) => {
    // is argument is 1, we can skip email in submitData since this is a login; if 0, add email as well to the object we wanna post
    for (let i = existingUser; i < 3; i++) {
      Object.defineProperty(submitData, schemaProperties[i], {
        value: inputVals[i],
        enumerable: true,
        configurable: true } );
      }
  };

  // store user login
  const trackingDevice = (user) => {
    // idk if u can set items alr set so this a safety precaution
    sessionStorage.clear();

    sessionStorage.setItem('userID', user['_id']);
    sessionStorage.setItem('userName', user['username']);
  };

  // --------------- helper functions END ---------------

  // wrapper func so we make sure url is set up before tryna send out any requests
  const listeners = () => {

    // --------------- registration ---------------

    document.querySelector('.reg-btn').addEventListener('click', function(e) {
      e.preventDefault();

      Array.from(document.querySelectorAll('.newUser')).forEach((inputField, index) => {
        inputVals[index] = $(inputField).val();
      });

      setFieldsToSend(0);

      if (inputVals.every(x => x)) {
        $.ajax({
          url: `${url}/newUser`,
          type: 'POST',
          data: JSON.stringify(submitData),
          contentType: 'application/json',
          success(user) {
            if (user !== 'username taken already. pls use a different username.') {
              alert('registered! and auto. logged in :)');
              trackingDevice(user);
            } else {
              alert('username already taken...');
            }

            Array.from(document.querySelectorAll('.newUser')).forEach((inputField, index) => {
              $(inputField).val('');
            });
          },
          error() { console.log('error: cannot call api'); }
        });
      } else {
        alert('pls enter all details');
        return;
      }
    }, false);

    // --------------- registration ENDS ---------------

    // --------------- login ---------------

    document.querySelector('.login-btn').addEventListener('click', function(e) {
      e.preventDefault();

      inputVals[1] = $('#loginUsername').val();
      inputVals[2] = $('#loginPassword').val();

      setFieldsToSend(1);

      if (inputVals[1] == '' || inputVals[2] == '') {
        alert('pls enter all details thx xx');
        return;
      } else {
        $.ajax({
          url: `${url}/loginUser`,
          type: 'POST',
          data: JSON.stringify(submitData),
          contentType: 'application/json',
          success(user) {

            if (user == 'user not found. please register :)') {
              alert('Username does not exist. Please register');
              return;

            } else if (user == 'not authorised') {
              alert('Incorrect Details. Please try again.');
              return;

            } else {
              trackingDevice(user);
              alert('You are now logged in');
              $('#loginUsername').val('');
              $('#loginPassword').val('');
            }
          },
          error() { console.log('error: cannot call api'); }
        });
      }
    }, false);

    // --------------- login ENDS ---------------

  // end of listeners wrapper func
  };

});