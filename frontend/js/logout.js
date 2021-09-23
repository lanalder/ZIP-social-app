$(document).ready(function() {

  // check often whether user logged in or not
  window.setTimeout(() => {

    // if they are, we want login btn to be logout when logged in and the link to be disabled to the login screen when clicked
    if (sessionStorage.getItem('user_id')) {
      document.querySelector('.login-logout').innerHTML = 'Logout';
      document.querySelector('.login-logout').href = window.location.href;

      document.querySelector('#addPostBtn').style.display = 'inline';
      document.querySelector('.profile-link').style.display = 'inline';

      // and vice versa w a sessionstorage clear when logged out clicked
      document.querySelector('.login-logout').addEventListener('click', function(e){
        sessionStorage.clear();
        alert('You are now logged out');
        window.location.href = 'index.html';
      }, false);

    } else {
      document.querySelector('.login-logout').href = 'login.html';
      document.querySelector('.login-logout').innerHTML = 'Login/Register';

      document.querySelector('#addPostBtn').style.display = 'none';
      document.querySelector('.profile-link').style.display = 'none';

    }

  }, 10);

});
