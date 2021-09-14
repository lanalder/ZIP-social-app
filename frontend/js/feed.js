$(document).ready(function(){

  const commentsIcon = document.querySelector('.comment-counter');
  const commentOutput = document.querySelector('.comments-output');
  // Hide/Show toggle of comments
  commentsIcon.addEventListener('click', function () {
    commentOutput.classList.toggle("display-none");
  });
});
