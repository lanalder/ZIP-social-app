$(document).ready(function() {

  let url,
    expandPostBtn = Array.from(document.querySelectorAll('.fa-expand'));

  $.ajax({
    url: 'config.json',
    type: 'GET',
    dataType: 'json',
    success(configData) {
      url = `${configData.SERVER_URL}:${configData.SERVER_PORT}`;
    },
    error(error) { console.log(error); }
  });

  // expandPostBtn.forEach((btn) => {
  //   btn.addEventListener('click', expandPost, false);
  // });









});
