$(document).ready(function() {

  // check often whether user logged in or not
  window.setTimeout(() => {

    // if they are, we want login btn to be logout when logged in and the link to be disabled to the login screen when clicked
    if (sessionStorage.getItem('userID')) {
      document.querySelector('.login-logout').innerHTML = 'Logout';
      document.querySelector('.login-logout').href = window.location.href;
      if (document.getElementById('addPostBtn').classList.contains('.display-block')== false) {
        document.getElementById('addPostBtn').classList.add('.display-block');
        console.log('working');
      }

      // and vice versa w a sessionstorage clear when logged out clicked
      document.querySelector('.login-logout').addEventListener('click', function(e){
        console.log(e);
        sessionStorage.clear();
        alert('You are now logged out');
        window.location.href = '';
      }, false);

    } else {
      document.querySelector('.login-logout').href = 'login.html';
      document.querySelector('.login-logout').innerHTML = 'Login/Register';
      if (document.getElementById('addPostBtn').classList.contains('.display-block')) {
        document.getElementById('addPostBtn').classList.remove('.display-block');
        console.log('display-none');
      }
    }
  }, 10);

});
