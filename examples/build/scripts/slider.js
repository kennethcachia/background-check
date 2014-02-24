
/* global BackgroundCheck:false */

(function () {

  var arrows;
  var strip;
  var slides;
  var dotsWrapper;
  var dots;
  var clickTargets;
  var x = 0;
  var delta;
  var prefixes;


  function init() {
    arrows = document.querySelectorAll('.slider-arrow');
    slides = document.querySelectorAll('.slider-item');
    strip = document.querySelector('.slider-strip');
    dotsWrapper = document.querySelector('.slider-dots');
    clickTargets = document.querySelectorAll('.slider-arrow, .slider-dots');

    delta = 100 / slides.length;
    prefixes = getPrefixedRules() || [];

    setStyles();
    bindEvents();
    hideArrows();

    var images;

    if (document.querySelector('.demo-css--fullscreen')) {
      images = '.slider-item';
    } else {
      images = 'img';
    }

    BackgroundCheck.init({
      targets: '.slider-arrow, .slider-dots',
      images: images
    });
  }


  function moveSlider(e) {
    var target = e.target;
    var dataPos = target.getAttribute('data-pos');

    if (typeof dataPos === 'string') {
      x = parseInt(dataPos, 10);
    } else if (target.className.indexOf('slider-arrow--left') !== -1) {
      x--;
    } else if (target.className.indexOf('slider-arrow--right') !== -1) {
      x++;
    }

    x = x > (slides.length - 1) ? (slides.length - 1) : x;
    x = x < 0 ? 0 : x;

    var pos = x * -delta;

    if (prefixes[0]) {
      strip.style[prefixes[0]] = 'translate3d(' + pos + '%, 0px, 0px)';
    } else {
      strip.style.position = 'relative';
      strip.style.left = -(x * 500) + 'px';
    }

    for (var d = 0; d < dots.length; d++) {
      dots[d].className = dots[d].className.replace(' slider-dot--active', '');

      if (x === d) {
        dots[d].className += ' slider-dot--active';
      }
    }

    if (!prefixes[1]) {
      setTimeout(function () {
        hideArrows();
        BackgroundCheck.refresh();
      }, 400);
    }
  }


  function classList(node, name, mode) {
    var className = node.className;

    switch (mode) {
    case 'add':
      className += ' ' + name;
      break;
    case 'remove':
      var pattern = new RegExp('(?:^|\\s)' + name + '(?!\\S)', 'g');
      className = className.replace(pattern, '');
      break;
    }

    node.className = className.trim();
  }


  function hideArrows() {
    var hiddenClass = 'slider-arrow--hidden';

    classList(arrows[0], hiddenClass, x === 0 ? 'add' : 'remove');
    classList(arrows[1], hiddenClass, x === slides.length - 1 ? 'add' : 'remove');
  }


  function getPrefixedRules() {
    var ua = navigator && navigator.userAgent,
      events = {
        'WebkitTransition': ['webkitTransform', 'webkitTransitionEnd'],
        'MozTransition': ['transform', 'transitionend'],
        'OTransition': ['oTransform', 'oTransitionEnd'],
        'MSTransition': ['msTransform', null],
        'transform': ['transform', ua.indexOf('Trident') === -1 ? 'transitionEnd' : null]
      };

    for (var e in events) {
      if (document.body.style[e] !== undefined) {
        return events[e];
      }
    }
  }


  function setStyles() {
    var dot;

    strip.style.width = (slides.length * 100) + '%';

    for (var s = 0; s < slides.length; s++) {
      slides[s].style.width = delta + '%';

      dot = document.createElement('div');
      dot.setAttribute('data-pos', s);
      dot.className = 'slider-dot' + (s === 0 ? ' slider-dot--active' : '');

      dotsWrapper.appendChild(dot);
    }

    dotsWrapper.style.marginLeft = -(dotsWrapper.clientWidth / 2) + 'px';
    dots = document.querySelectorAll('.slider-dot');
  }


  function bindEvents() {

    for (var t = 0; t < clickTargets.length; t++) {
      clickTargets[t].addEventListener('click', moveSlider);
      clickTargets[t].addEventListener('click', moveSlider);
    }

    if (prefixes[1]) {
      strip.addEventListener(prefixes[1], function () {
        hideArrows();
        BackgroundCheck.refresh();
      });
    }
  }


  // Init
  document.addEventListener('DOMContentLoaded', init);

}());
