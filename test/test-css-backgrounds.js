
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

  // Create elements first
  var examples = document.querySelectorAll('.test--css-backgrounds .css-background'),
      snippets = document.querySelectorAll('.test--css-backgrounds .css-background p'),
      css,
      image = 1,
      rule,
      element,
      dash,
      snippet;

  for (var e = 0; e < examples.length; e++) {
    snippet = snippets[e].innerHTML;

    element = document.createElement('div');
    element.style.backgroundImage = 'url("../examples/images/' + image + '.jpg")';
    element.classList.add('css-background-image');

    css = snippet.split(';');

    for (var c = 0; c < css.length; c++) {
      rule = css[c];
      rule = rule.split(': ');

      if (rule.length > 1) {
        dash = rule[0].indexOf('-');
        rule[0] = rule[0].substring(0, dash) + rule[0][dash + 1].toUpperCase() + rule[0].substring(dash + 2);
        element.style[rule[0]] = rule[1];
      }
    }

    examples[e].appendChild(element);
    image = image === 6 ? 1 : ++image;
  }

  // Wait and test
  setTimeout(function () {
    var test = document.querySelector('.test--css-backgrounds'),
        runningClass = 'test--css-backgrounds--running';

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
