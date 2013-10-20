
/*
 * BackgroundCheck
 * http://kennethcachia.com/background-check
 *
 * v1.1.2
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
    attrs.debug         = checkAttr(a.debug, false);
    attrs.debugOverlay  = checkAttr(a.debugOverlay, false);
    attrs.targets       = getElements(a.targets);
    attrs.images        = getElements(a.images || 'img', true);
    attrs.changeParent  = checkAttr(a.changeParent, false);
    attrs.threshold     = checkAttr(a.threshold, 50);
    attrs.minComplexity = checkAttr(a.minComplexity, 30);
    attrs.minOverlap    = checkAttr(a.minOverlap, 50);
    attrs.windowEvents  = checkAttr(a.windowEvents, true);
    attrs.maxDuration   = checkAttr(a.maxDuration, 500);

    attrs.mask = checkAttr(a.mask, {
      r: 0,
      g: 255,
      b: 0
    });

    attrs.classes = checkAttr(a.classes, {
      dark: 'background--dark',
      light: 'background--light',
      complex: 'background--complex'
    });

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
   * Get attribute value, use a default
   * when undefined
   */
  function checkAttr(value, def) {
    checkType(value, typeof def);
    return (value === undefined) ? def : value;
  }


  /*
   * Reject unwanted types
   */
  function checkType(value, type) {
    if (value !== undefined && typeof value !== type) {
      throw 'Incorrect attribute type';
    }
  }


  /*
   * Convert elements with background-image
   * to Images
   */
  function checkForCSSImages(els) {
    var el,
        url,
        list = [];

    for (var e = 0; e < els.length; e++) {
      el = els[e];
      list.push(el);

      if (el.tagName !== 'IMG') {
        url = window.getComputedStyle(el).backgroundImage;

        // Ignore multiple backgrounds
        if (url.split(',').length > 1) {
          throw 'Multiple backgrounds are not supported';
        }

        if (url && url !== 'none') {

          list[e] = {
            img: new Image(),
            el: list[e]
          };

          list[e].img.src = url.slice(4, -1);
          log('CSS Image - ' + url);
        } else {
          throw 'Element is not an <img> but does not have a background-image';
        }
      }
    }

    return list;
  }


  /*
   * Check for String, Element or NodeList
   */
  function getElements(selector, convertToImages) {
    var els = selector;

    if (typeof selector === 'string') {
      els = document.querySelectorAll(selector);
    } else if (selector && selector.nodeType === 1) {
      els = [selector];
    }

    if (!els || els.length === 0 || els.length === undefined) {
      throw 'Elements not found';
    } else {
      if (convertToImages) {
        els = checkForCSSImages(els);
      }

      els = Array.prototype.slice.call(els);
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

    showDebugOverlay();
  }


  /*
   * Show <canvas> on top of page
   */
  function showDebugOverlay() {

    if (get('debugOverlay')) {
      canvas.style.opacity = 0.5;
      canvas.style.pointerEvents = 'none';
      document.body.appendChild(canvas);
    } else {
      canvas.remove();
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
   * Set width and height of <canvas>
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
   * Process px and %, discard anything else
   */
  function getValue(css, parent, delta) {
    var value;
    var percentage;

    if (css.indexOf('px') !== -1) {
      value = parseFloat(css);
    } else if (css.indexOf('%') !== -1) {
      value = parseFloat(css);
      percentage = value / 100;
      value = percentage * parent;

      if (delta) {
        value -= delta * percentage;
      }
    } else {
      value = parent;
    }

    return value;
  }


  /*
   * Find top, left, width and height
   * from the object's CSS
   */
  function calculateAreaFromCSS(obj) {

    /*
      Supported
      ---------
      background-size: cover, contain, auto, px, %
      background-position: top, left, center, right, bottom, px, %

      Current Limitations
      -------------------
      Multiple background images not supported
      background-repeat is forced to 'no-repeat'
      background-origin is forced to 'padding-box'
    */

    var css = window.getComputedStyle(obj.el),
        size = css.backgroundSize.split(' '),
        position = css.backgroundPosition.split(' '),
        x = css.backgroundPositionX,
        y = css.backgroundPositionY,
        parentRatio = obj.el.clientWidth / obj.el.clientHeight,
        imgRatio = obj.img.naturalWidth / obj.img.naturalHeight,
        width = size[0],
        height = size[1] === undefined ? 'auto' : size[1];

    // Force no-repeat and padding-box
    obj.el.style.backgroundRepeat = 'no-repeat';
    obj.el.style.backgroundOrigin = 'padding-box';

    // Background Size
    if (width === 'cover') {

      if (parentRatio >= imgRatio) {
        width = '100%';
        height = 'auto';
      } else {
        width = 'auto';
        size[0] = 'auto';
        height = '100%';
      }
    } else if (width === 'contain') {

      if (1 / parentRatio < 1 / imgRatio) {
        width = 'auto';
        size[0] = 'auto';
        height = '100%';
      } else {
        width = '100%';
        height = 'auto';
      }
    }

    if (width === 'auto') {
      width = obj.img.naturalWidth;
    } else {
      width = getValue(width, obj.el.clientWidth);
    }

    if (height === 'auto') {
      height = (width / obj.img.naturalWidth) * obj.img.naturalHeight;
    } else {
      height = getValue(height, obj.el.clientHeight);
    }

    if (size[0] === 'auto' && size[1] !== 'auto') {
      width = (height / obj.img.naturalHeight) * obj.img.naturalWidth;
    }

    // Background Position
    x = getValue(x, obj.el.clientWidth, width);
    y = getValue(y, obj.el.clientHeight, height);

    // Take care of ex: background-position: right 20px bottom 20px;
    if (position.length === 4) {

      if (position[0] === 'right') {
        x = obj.el.clientWidth - obj.img.naturalWidth - x;
      }

      if (position[2] === 'bottom') {
        y = obj.el.clientHeight - obj.img.naturalHeight - y;
      }
    }

    x += obj.el.getBoundingClientRect().left;
    y += obj.el.getBoundingClientRect().top;

    return {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
      width: width,
      height: height
    };
  }


  /*
   * Get Bounding Client Rect
   */
  function getArea(obj) {
    var area,
        image,
        parent,
        ratio,
        delta;

    if (obj.nodeType) {
      area = obj.getBoundingClientRect();
      parent = obj.parentNode;
      image = obj;

      area = {
        top: area.top,
        width: area.width,
        left: area.left,
        right: area.right,
        height: area.height,
        bottom: area.bottom
      };

    } else {
      area = calculateAreaFromCSS(obj);
      parent = obj.el;
      image = obj.img;
    }

    parent = parent.getBoundingClientRect();

    area.imageTop = 0;
    area.imageLeft = 0;
    area.imageWidth = image.naturalWidth;
    area.imageHeight = image.naturalHeight;
    ratio = area.imageHeight / area.height;

    // Stay within the parent's boundary
    if (area.top < parent.top) {
      delta = parent.top - area.top;
      area.imageTop = ratio * delta;
      area.imageHeight -= ratio * delta;
      area.top += delta;
      area.height -= delta;
    }

    if (area.left < parent.left) {
      delta = parent.left - area.left;
      area.imageLeft += ratio * delta;
      area.imageWidth -= ratio * delta;
      area.width -= delta;
      area.left += delta;
    }

    if (area.bottom > parent.bottom) {
      delta = area.bottom - parent.bottom;
      area.imageHeight -= ratio * delta;
      area.height -= delta;
    }

    if (area.right > parent.right) {
      delta = area.right - parent.right;
      area.imageWidth -= ratio * delta;
      area.width -= delta;
    }

    return area;
  }


  /*
   * Render image on canvas
   */
  function drawImage(image) {
    var area = getArea(image);

    image = image.nodeType ? image : image.img;
    context.drawImage(image, area.imageLeft, area.imageTop, area.imageWidth, area.imageHeight, area.left, area.top, area.width, area.height);
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
    a = (a.nodeType ? a : a.el).getBoundingClientRect();
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
   * Find the element's zIndex. Also checks
   * the zIndex of its parent
   */
  function getZIndex(el) {
    var parent = el.parentNode,
        zIndexEl,
        zIndexParent,
        calculate = function (el) {
          var zindex = 0;

          if (window.getComputedStyle(el).position !== 'static') {
            zindex = parseInt(window.getComputedStyle(el).zIndex, 10) || 0;

            // Reserve zindex = 0 for elements with position: static;
            if (zindex >= 0) {
              zindex++;
            }
          }

          return zindex;
        };

    zIndexParent = parent ? calculate(parent) : 0;
    zIndexEl = calculate(el);

    return (zIndexParent * 100000) + zIndexEl;
  }


  /*
   * Check zIndexes
   */
  function sortImagesByZIndex(images) {
    var sorted = false;

    images.sort(function (a, b) {
      a = a.nodeType ? a : a.el;
      b = b.nodeType ? b : b.el;

      var pos = a.compareDocumentPosition(b),
          reverse = 0;

      a = getZIndex(a);
      b = getZIndex(b);

      if (a > b) {
        sorted = true;
      }

      // Reposition if zIndex is the same but the elements are not
      // sorted according to their document position
      if (a === b && pos === 2) {
        reverse = 1;
      } else if (a === b && pos === 4) {
        reverse = -1;
      }

      return reverse || a - b;
    });

    log('Sorted: ' + sorted);

    if (sorted) {
      log(images);
    }

    return sorted;
  }


  /*
   * Main function
   */
  function check(target, avoidClear, imageLoaded) {
    var image,
        loading = false,
        mask = get('mask'),
        sorted,
        processImages = imageLoaded ? [imageLoaded] : get('images');

    log('--- BackgroundCheck ---');
    log('onLoad event: ' + (imageLoaded && imageLoaded.src));

    if (supported) {

      if (avoidClear !== true) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = 'rgb(' + mask.r + ', ' + mask.g + ', ' + mask.b + ')';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      sorted = sortImagesByZIndex(processImages);

      for (var i = 0; i < processImages.length; i++) {
        image = processImages[i];

        if (isInside(image, viewport)) {

          if (image.naturalWidth === 0) {
            loading = true;
            log('Loading... ' + image.src);

            image.removeEventListener('load', check);

            if (sorted) {
              // Sorted -- redraw all images
              image.addEventListener('load', check.bind(null, null, false, null));
            } else {
              // Not sorted -- just draw one image
              image.addEventListener('load', check.bind(null, target, true, image));
            }
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
        newValue = getElements(property === 'images' && !newValue ? 'img' : newValue, property === 'images' ? true : false);
      } catch (err) {
        newValue = [];
        throw err;
      }
    } else {
      checkType(newValue, typeof attrs[property]);
    }

    removeClasses();
    attrs[property] = newValue;
    check();

    if (property === 'debugOverlay') {
      showDebugOverlay();
    }
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
