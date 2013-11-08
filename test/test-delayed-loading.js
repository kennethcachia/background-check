
asyncTest('Test delayed image loading', function () {

  var target1 = wrapper.querySelector('.test .target--one');
  var target2 = wrapper.querySelector('.test .target--two');

  for (var i = 0; i < images.length; i++) {
    images[i].setAttribute('data-src', images[i].getAttribute('src'));
    images[i].removeAttribute('src');
  }

  BackgroundCheck.init({
    targets: '.test .target',
    images: '.test img',
    debug: true
  })

  for (var i = 0; i < images.length; i++) {
    images[i].setAttribute('src', images[i].getAttribute('data-src'));
  }

  setTimeout(function () {
    start();
    equal(target1.className, 'target target--one background--dark', 'correct classes are added');
    equal(target2.className, 'target target--two background--light background--complex', 'correct classes are added');
  }, 100);

});
