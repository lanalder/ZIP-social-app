$(document).ready(function() {

  let url;

  $.ajax({
    url: 'config.json',
    type: 'GET',
    dataType: 'json',
    success(configData) {
      url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
    },
    error(error) { console.log(error); }
  });

  // ---------- generate cards with post content ----------

  const cards = () => {
    // hash param of URI either: #me when clicked on My Profile (user's own profile), or #username when clicked on someone elses, this specifies backend endpoint
    const clickedUser = window.location.hash.substring(1);

    if (clickedUser === 'me') {
      clickedUser === sessionStorage.getItem('username');
    }

    $.ajax({
      url: `${url}/userPosts/${clickedUser}`,
      type:'GET',
      dataType: 'json',
      success(posts) {
        document.querySelector('.container').innerHTML = '';


      }
    });
  };

});
