/* global BackgroundCheck:false */

document.addEventListener('DOMContentLoaded', function () {

  // Prepare BackgroundCheck
  var path = window.location.pathname.split('/');
  path.pop();

  var canvas = document.getElementById('demo-canvas'),
    ctx = canvas.getContext('2d');

  var img = new Image();
  img.src = window.location.protocol + '//' + window.location.host + path.join('/') + '/images/2.jpg';

  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    BackgroundCheck.init({
      targets: '.target',
      images: '#demo-canvas'
    });
  };

});
