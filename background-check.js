
/*
 * BackgroundCheck
 * http://kennethcachia.com/background-check
 *
 * v1.1.0
 */

(function (root, factory) {

  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.BackgroundCheck = factory(root);
  }

}(this, function () {

  'use strict';

  var resizeEvent = window.orientation !== undefined ? 'orientationchange' : 'resize',
      supported,
      canvas,
      context,
      throttleDelay,
      viewport,
      attrs = {};

  /*
   * Initializer
   */
  function init(a) {

    if (a === undefined || a.targets === undefined) {
      throw 'Missing attributes';
    }

    // Default values
    attrs.targets = getElements(a.targets);
    attrs.images = getElements(a.images || 'img');
    attrs.changeParent = a.changeParent || false;
    attrs.threshold = a.threshold || 50;
    attrs.minComplexity = a.minComplexity || 30;
    attrs.minOverlap = a.minOverlap || 50;
    attrs.windowEvents = a.windowEvents || true;
    attrs.maxDuration = a.maxDuration || 500;
    attrs.mask = a.mask || { r: 0, g: 255, b: 0 };
    attrs.debug = a.debug || false;
    attrs.classes = a.classes || {
      dark: 'background--dark',
      light: 'background--light',
      complex: 'background--complex'
    };

    if (supported === undefined) {
      checkSupport();

      if (supported) {
        canvas.style.position = 'fixed';
        canvas.style.top = '0px';
        canvas.style.left = '0px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';

        window.addEventListener(resizeEvent, throttle.bind(null, function () {
          resizeCanvas();
          check();
        }));

        window.addEventListener('scroll', throttle.bind(null, check));

        resizeCanvas();
        check();
      }
    }
  }


  /*
   * Destructor
   */
  function destroy() {
    supported = null;
    canvas = null;
    context = null;
    attrs = {};

    if (throttleDelay) {
      clearTimeout(throttleDelay);
    }
  }


  /*
   * Output debug logs
   */
  function log(msg) {
    if (get('debug')) {
      console.log(msg);
    }
  }

  /*
   * Check for String, Element or NodeList
   */
  function getElements(selector) {
    var els = selector;

    if (typeof selector === 'string') {
      els = document.querySelectorAll(selector);
    } else if (selector.nodeType === 1) {
      els = [selector];
    }

    if (!els || els.length === 0) {
      throw 'Elements not found';
    }

    return els;
  }


  /*
   * Check if browser supports <canvas>
   */
  function checkSupport() {
    canvas = document.createElement('canvas');

    if (canvas && canvas.getContext) {
      context = canvas.getContext('2d');
      supported = true;
    } else {
      supported = false;
    }
  }


  /*
   * Stop if it's slow
   */
  function kill(start) {
    var duration = new Date().getTime() - start;

    log('Duration: ' + duration + 'ms');

    if (duration > get('maxDuration')) {
      // Log a message even when debug is false
      console.log('BackgroundCheck - Killed');
      removeClasses();
      destroy();
    }
  }


  /*
   * Set widh and height of <canvas>
   */
  function resizeCanvas() {
    viewport = {
      left: 0,
      top: 0,
      right: document.body.clientWidth,
      bottom: window.innerHeight
    };

    canvas.width = document.body.clientWidth;
    canvas.height = window.innerHeight;
  }


  /*
   * Render image on canvas
   */
  function drawImage(image) {
    var area = image.boundingClientRect || image.getBoundingClientRect();
    context.drawImage(image, area.left, area.top, area.width, area.height);
  }


  /*
   * Remove classes from element or
   * their parents, depending on checkParent
   */
  function removeClasses(el) {
    var targets = el ? [el] : get('targets'),
        target;

    for (var t = 0; t < targets.length; t++) {
      target = targets[t];
      target = get('changeParent') ? target.parentNode : target;
      target.classList.remove(get('classes').light);
      target.classList.remove(get('classes').dark);
      target.classList.remove(get('classes').complex);
    }
  }


  /*
   * Calculate average pixel brightness of a region
   * and add 'light' or 'dark' accordingly
   */
  function calculatePixelBrightness(target) {
    var dims = target.getBoundingClientRect(),
        brightness,
        data,
        pixels = 0,
        delta,
        deltaSqr = 0,
        mean = 0,
        variance,
        minOverlap = 0,
        mask = get('mask');

    if (dims.width > 0 && dims.height > 0) {
      removeClasses(target);

      target = get('changeParent') ? target.parentNode : target;
      data = context.getImageData(dims.left, dims.top, dims.width, dims.height).data;

      for (var p = 0; p < data.length; p += 4) {

        if (data[p] === mask.r && data[p + 1] === mask.g && data[p + 2] === mask.b) {
          minOverlap++;
        } else {
          pixels++;
          brightness = (0.2126 * data[p]) + (0.7152 * data[p + 1]) + (0.0722 * data[p + 2]);
          delta = brightness - mean;
          deltaSqr += delta * delta;
          mean = mean + delta / pixels;
        }
      }

      if (minOverlap <= (data.length / 4) * (1 - (get('minOverlap') / 100))) {
        variance = Math.sqrt(deltaSqr / pixels) / 255;
        mean = mean / 255;
        log('Target: ' + target.className +  ' lum: ' + mean + ' var: ' + variance);
        target.classList.add(mean <= (get('threshold') / 100) ? get('classes').dark : get('classes').light);

        if (variance > get('minComplexity') / 100) {
          target.classList.add(get('classes').complex);
        }
      }
    }
  }


  /*
   * Test if a is within b's boundary
   */
  function isInside(a, b) {
    a = a.getBoundingClientRect();
    b = b === viewport ? b : b.getBoundingClientRect();

    return !(a.right < b.left || a.left > b.right || a.top > b.bottom || a.bottom < b.top);
  }


  /*
   * Process all targets (checkTarget is undefined)
   * or a single target (checkTarget is a previously set target)
   *
   * When not all images are loaded, checkTarget is an image
   * to avoid processing all targets multiple times
   */
  function processTargets(checkTarget) {
    var start = new Date().getTime(),
        mode = (checkTarget && checkTarget.tagName === 'IMG') ? 'image' : 'targets',
        found = checkTarget ? false : true,
        total = get('targets').length,
        target;

    for (var t = 0; t < total; t++) {
      target = get('targets')[t];

      if (isInside(target, viewport)) {
        if (mode === 'targets' && (!checkTarget || checkTarget === target)) {
          found = true;
          calculatePixelBrightness(target);
        } else if (mode === 'image' && isInside(target, checkTarget)) {
          calculatePixelBrightness(target);
        }
      }
    }

    if (mode === 'targets' && !found) {
      throw checkTarget + ' is not a target';
    }

    kill(start);
  }


  /*
   * Main function
   */
  function check(target, avoidClear, imageLoaded) {
    var image,
        loading = false,
        mask = get('mask'),
        processImages = imageLoaded ? [imageLoaded] : get('images');

    log('--- BackgroundCheck ---');
    log('Loading: ' + loading);
    log('onLoad event: ' + (imageLoaded && imageLoaded.src));

    if (supported) {

      if (avoidClear !== true) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgb(' + mask.r + ', ' + mask.g + ', ' + mask.b + ')';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      for (var i = 0; i < processImages.length; i++) {
        image = processImages[i];

        if (isInside(image, viewport)) {
          // create a new image if image is actually a div with a background image
          if (image.tagName == "DIV" && image.style.backgroundImage !== undefined){
            var image2 = new Image();
            image2.src = image.style.backgroundImage.replace(/url\(|\)/gi,'');
            image2.boundingClientRect = image.getBoundingClientRect();
            image = image2;
          }
          if (image.naturalWidth === 0) {
            loading = true;
            log('Loading... ' + image.src);
            image.addEventListener('load', check.bind(null, target, true, image));
          } else {
            log('Drawing: ' + image.src);
            drawImage(image);
          }
        }
      }

      if (!imageLoaded && !loading) {
        processTargets(target);
      } else if (imageLoaded) {
        processTargets(imageLoaded);
      }
    }
  }


  /*
   * Throttle events
   */
  function throttle(callback) {

    if (get('windowEvents') === true) {

      if (throttleDelay) {
        clearTimeout(throttleDelay);
      }

      throttleDelay = setTimeout(callback, 200);
    }
  }


  /*
   * Setter
   */
  function set(property, newValue) {

    if (attrs[property] === undefined) {
      throw 'Unknown property - ' + property;
    } else if (newValue === undefined) {
      throw 'Missing value for ' + property;
    }

    if (property === 'targets' || property === 'images') {

      try {
        newValue = getElements(property === 'images' && !newValue ? 'img' : newValue);
      } catch (err) {
        newValue = [];
        throw err;
      }
    }

    removeClasses();
    attrs[property] = newValue;
    check();
  }


  /*
   * Getter
   */
  function get(property) {

    if (attrs[property] === undefined) {
      throw 'Unknown property - ' + property;
    }

    return attrs[property];
  }


  return {
    /*
     * Init and destroy
     */
    init: init,
    destroy: destroy,

    /*
     * Expose main function
     */
    refresh: check,

    /*
     * Setters and getters
     */
    set: set,
    get: get
  };

}));
