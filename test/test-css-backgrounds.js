
/*
 * This test is successful on Safari and Chrome, but 'fails' in some cases
 * by a couple of px's on other browsers. While this is not ideal, the plugin 
 * still works fine on these browsers as setting debugOverlay:true shows
 * that the images are superimposed
 */

asyncTest('Test CSS Backgrounds', function () {

  throws(function () {
    BackgroundCheck.init({
      targets: '.test .target',
      images: '.test--css-backgrounds .css-background'
    });
  }, 'throws exception - elements are not images and do not have a background image');


  // Tests for multiple backgrounds
  var multiple = document.querySelector('.test--css-backgrounds .css-background--multiple');

  throws(function () {
    BackgroundCheck.init({
      targets: '.test .target',
      images: multiple
    });
  }, 'throws exception - multiple backgrounds are not supported (1)');

  throws(function () {
    multiple.style.backgroundImage = 'url(../examples/build/images/1.jpg), url(' + window.DataURI + ')';

    BackgroundCheck.init({
      targets: '.test .target',
      images: multiple
    });
  }, 'throws exception - multiple backgrounds are not supported (2)');

  throws(function () {
    multiple.style.backgroundImage = 'url(' + window.DataURI + '), url(../examples/build/images/1.jpg)';

    BackgroundCheck.init({
      targets: '.test .target',
      images: multiple
    });
  }, 'throws exception - multiple backgrounds are not supported (3)');

  throws(function () {
    multiple.style.backgroundImage = 'url(' + window.DataURI + '), url(' + window.DataURI + ')';

    BackgroundCheck.init({
      targets: '.test .target',
      images: multiple
    });
  }, 'throws exception - multiple backgrounds are not supported (4)');

  throws(function () {
    multiple.style.backgroundImage = 'url(' + window.DataURI + '), url(' + window.DataURI + '), url(' + window.DataURI + ')';

    BackgroundCheck.init({
      targets: '.test .target',
      images: multiple
    });
  }, 'throws exception - multiple backgrounds are not supported (5)');

  throws(function () {
    multiple.style.backgroundImage = 'url(../examples/build/images/1.jpg), url(../examples/build/images/1.jpg), url(../examples/build/images/1.jpg)';

    BackgroundCheck.init({
      targets: '.test .target',
      images: multiple
    });
  }, 'throws exception - multiple backgrounds are not supported (6)');


  // Create elements first
  var examples = document.querySelectorAll('.test--css-backgrounds .css-background');
  var snippets = document.querySelectorAll('.test--css-backgrounds .css-background p');
  var css;
  var image = 1;
  var rule;
  var element;
  var dash;
  var snippet;
  var url;

  for (var e = 0; e < examples.length; e++) {
    snippet = snippets[e].innerHTML;

    url = image === 1 ? window.DataURI : '../examples/build/images/' + image + '.jpg';

    element = document.createElement('div');
    element.style.backgroundImage = 'url(' + url + ')';
    element.className = 'css-background-image';

    css = snippet.split(';');

    for (var c = 0; c < css.length; c++) {
      rule = css[c];
      rule = rule.split(': ');

      if (rule.length > 1) {
        dash = rule[0].indexOf('-');
        rule[0] = rule[0].substring(0, dash) + rule[0][dash + 1].toUpperCase() + rule[0].substring(dash + 2);

        // Weird issue - Chrome sets backgroundPosition: inherit inherit
        if (rule[0] === 'backgroundPosition' && rule[1] === 'inherit') {
          element.style.backgroundPositionX = 'inherit';
        } else {
          element.style[rule[0]] = rule[1];
        }
      }
    }

    examples[e].appendChild(element);
    image = image === 6 ? 1 : ++image;
  }

  // Wait and test
  setTimeout(function () {
    start();
    window.scrollTo(0, 0);

    // Initialize BackgroundCheck
    BackgroundCheck.init({
      targets: '.test .target',
      images: '.test--css-backgrounds .css-background-image'
    });

    deepEqual(BackgroundCheck.getImageData(), CSS_BACKGROUNDS_EXPECTED, 'dimensions and coordinates match');
  }, 100);
});
