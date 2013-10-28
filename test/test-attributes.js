
test('Test attribute values with .init() and .get()', function () {

  throws(function () {
    BackgroundCheck.init();
  }, 'throws exception when no attributes are passed to init()');

  BackgroundCheck.init({
    targets: '.test .target'
  });

  deepEqual(BackgroundCheck.get('targets'), targetsArray, 'returns an array with all targets');
  deepEqual(BackgroundCheck.get('images'), allImages, 'returns all images when img is undefined');
  strictEqual(BackgroundCheck.get('changeParent'), false, 'default value is correct - changeParent');
  strictEqual(BackgroundCheck.get('threshold'), 50, 'default value is correct - threshold');
  strictEqual(BackgroundCheck.get('minComplexity'), 30, 'default value is correct - minComplexity');
  strictEqual(BackgroundCheck.get('minOverlap'), 50, 'default value is correct - minOverlap');
  strictEqual(BackgroundCheck.get('windowEvents'), true, 'default value is correct - windowEvents');
  strictEqual(BackgroundCheck.get('maxDuration'), 500, 'default value is correct - maxDuration');
  strictEqual(BackgroundCheck.get('debug'), false, 'default value is correct - debug');

  deepEqual(BackgroundCheck.get('mask'), { 
    r: 0,
    g: 255,
    b: 0 
  }, 'default value is correct - mask');

  deepEqual(BackgroundCheck.get('classes'), {
    dark: 'background--dark',
    light: 'background--light',
    complex: 'background--complex'
  }, 'default value is correct - classes');

  BackgroundCheck.init({
    targets: document.querySelectorAll('.test .target')
  });

  deepEqual(BackgroundCheck.get('targets'), targetsArray, 'returns an array of targets');

  BackgroundCheck.init({
    targets: document.querySelector('.test .target')
  });

  deepEqual(BackgroundCheck.get('targets'), [target], 'returns an array with one target');

  throws(function () {
    BackgroundCheck.init({
      targets: '.element'
    });
  }, 'throws exception - .element does not exist');

  throws(function () {
    BackgroundCheck.init({
      targets: false
    });
  }, 'throws exception - targets: false');


  throws(function () {
    BackgroundCheck.init({
      targets: 1
    });
  }, 'throws exception - targets: 1');

  BackgroundCheck.init({
    targets: '.test .target',
    images: images,
    changeParent: true,
    windowEvents: false,
    threshold: 60,
    debug: true
  });

  deepEqual(BackgroundCheck.get('images'), Array.prototype.slice.call(images), 'returns an array with all images');
  strictEqual(BackgroundCheck.get('changeParent'), true, 'returns changeParent as true');
  strictEqual(BackgroundCheck.get('windowEvents'), false, 'returns windowEvents as false');
  strictEqual(BackgroundCheck.get('threshold'), 60, 'returns threshold as 60');
  strictEqual(BackgroundCheck.get('debug'), true, 'returns debug as true');
  strictEqual(BackgroundCheck.get('minOverlap'), 50, 'returns minOverlap as 50');

  throws(function () {
    BackgroundCheck.init({
      test: '.test'
    });
  }, 'throws unkown attribute exception');

  throws(function () {
    BackgroundCheck.get('test');
  }, 'throws an unknown property exception');

  throws(function () {
    BackgroundCheck.init({
      targets: targets,
      windowEvents: 1
    });
  }, 'throws an unknown type exception');

});


test('Setting attribute values', function () {

  BackgroundCheck.init({
    targets: targets
  });

  BackgroundCheck.set('windowEvents', false);
  BackgroundCheck.set('debug', true);
  BackgroundCheck.set('minComplexity', 90);

  strictEqual(BackgroundCheck.get('windowEvents'), false, 'returns windowEvents as false');
  strictEqual(BackgroundCheck.get('debug'), true, 'returns debug as true');
  strictEqual(BackgroundCheck.get('minComplexity'), 90, 'returns minComplexity as 90');

  throws(function () {
    BackgroundCheck.set('targets', 'test');
  }, 'throws elements not found');

  BackgroundCheck.set('targets', targets);
  deepEqual(BackgroundCheck.get('targets'), targetsArray, 'returns an array of targets');

  BackgroundCheck.set('targets', '.test .target');
  deepEqual(BackgroundCheck.get('targets'), targetsArray, 'returns an array of targets');

  BackgroundCheck.set('targets', target);
  deepEqual(BackgroundCheck.get('targets'), [target], 'returns an array with one target');

  throws(function () {
    BackgroundCheck.set('debug', 1);
  }, 'throws an incorrect type exception');

  throws(function () {
    BackgroundCheck.set('targets', true);
  }, 'throws an incorrect type exception');

  throws(function () {
    BackgroundCheck.set('test', true);
  }, 'throws an unkown property exception');

  throws(function () {
    BackgroundCheck.set('targets');
  }, 'throws a missing value exception');

});


test('Call .refresh() with an element that was not originally set as a target', function () {

  BackgroundCheck.init({
    targets: targets
  });

  throws(function () {
    BackgroundCheck.refresh(placeholder);
  }, 'throws an unknown target exception');

});
