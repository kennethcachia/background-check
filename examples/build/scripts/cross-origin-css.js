
/* global BackgroundCheck:false */

function convertImageToDataURI(img) {
  var canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;

  var ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  return canvas.toDataURL('image/png');
}


window.addEventListener('DOMContentLoaded', function () {
  var img = new Image();
  img.setAttribute('crossorigin');

  var background = document.querySelector('.demo-css--cross-origin');
  var dataSrc = background.getAttribute('data-src');

  img.onload = function () {
    var data = convertImageToDataURI(img);
    background.style.backgroundImage = 'url(' + data + ')';

    // Prepare BackgroundCheck
    BackgroundCheck.init({
      targets: '.target',
      images: background
    });
  };

  img.src = dataSrc;
});
