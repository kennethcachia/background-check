asyncTest('Test Canvas Backgrounds', function () {

  var EXPECTED_CANVAS_RESULT = [
    {
      "bottom": 1553.375,
      "height": 150,
      "imageHeight": 150,
      "imageLeft": 0,
      "imageTop": 0,
      "imageWidth": 300,
      "left": 0,
      "right": 300,
      "top": 1403.375,
      "width": 300
    }
  ];

  var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

  var img = new Image();
  img.src = window.DataURI;

  img.onload = function () {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  setTimeout(function () {
    start();
    window.scrollTo(0, 0);

    // Initialize BackgroundCheck
    BackgroundCheck.init({
      targets: '.test .target',
      images: '#canvas'
    });

    deepEqual(BackgroundCheck.getImageData(), EXPECTED_CANVAS_RESULT, 'dimensions and coordinates match');

  }, 100);
});