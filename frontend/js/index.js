const commentsIcon = document.querySelector('.comment-counter');
const commentOutput = document.querySelector('.comments-output');

commentsIcon.addEventListener('click', function () {
  commentOutput.classList.toggle("display-none");
});
