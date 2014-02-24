
/* global BackgroundCheck:false */

document.addEventListener('DOMContentLoaded', function () {
  // Load image
  var img = document.querySelector('img');
  img.src = img.getAttribute('data-src');

  // Prepare BackgroundCheck
  BackgroundCheck.init({
    targets: '.target',
    images: img
  });
});
