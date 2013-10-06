
/* global BackgroundCheck:false */

var drag,
    offset,
    demo,
    touch = document.ontouchstart !== undefined ? true : false;


function updatePosition(e) {
  var wrapper = {
    x: demo.offsetLeft,
    y: demo.offsetTop
  };

  if (touch) {
    e.preventDefault();
  }

  drag.style.left = ((e.pageX - offset.x) - wrapper.x) + 'px';
  drag.style.top = ((e.pageY - offset.y) - wrapper.y) + 'px';
}


function getUIElement(el, child) {
  var name = 'border',
      required;

  if (el.className.indexOf(name) !== -1) {
    required = child ? el.children[0] : el;
  } else if (el.parentNode.className.indexOf(name) !== -1) {
    required = child ? el : el.parentNode;
  }

  return required;
}


window.addEventListener('DOMContentLoaded', function () {
  demo = document.querySelector('.demo');

  // Click
  window.addEventListener(touch ? 'touchstart' : 'mousedown', function (e) {
    drag = null;
    drag = getUIElement(e.target);

    if (drag) {
      offset = {
        x: e.offsetX || e.layerX,
        y: e.offsetY || e.layerY
      };

      window.addEventListener(touch ? 'touchmove' : 'mousemove', updatePosition);
    }
  });

  // Release
  window.addEventListener(touch ? 'touchend' : 'mouseup', function () {
    if (drag) {
      window.removeEventListener(touch ? 'touchmove' : 'mousemove', updatePosition);
      BackgroundCheck.refresh(getUIElement(drag, true));
    }
  });

  // Prepare BackgroundCheck
  BackgroundCheck.init({
    targets: '.target',
    images: '.image'
  });
});
