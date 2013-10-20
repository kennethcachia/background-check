
/* global BackgroundCheck:false */

window.addEventListener('DOMContentLoaded', function () {

  // Create elements first
  var examples = document.querySelectorAll('.demo-images .demo-background'),
      snippets = document.querySelectorAll('.demo-images .demo-background p'),
      css,
      image = 1,
      rule,
      element,
      dash,
      snippet;

  for (var e = 0; e < examples.length; e++) {
    snippet = snippets[e].innerHTML;

    element = document.createElement('div');
    element.style.backgroundImage = 'url(images/' + image + '.jpg)';
    element.classList.add('demo-background-image');

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

  BackgroundCheck.init({
    targets: '.target',
    images: '.demo-background-image',
    debug: true
  });
});
