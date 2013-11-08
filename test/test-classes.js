
test('Test light, dark and complex classes', function () {

  var target1 = wrapper.querySelector('.test .target--one');
  var target2 = wrapper.querySelector('.test .target--two');

  BackgroundCheck.init({
    targets: '.test .target',
    images: '.test img'
  })

  equal(target1.className, 'target target--one background--dark', 'correct classes are added');
  equal(target2.className, 'target target--two background--light background--complex', 'correct classes are added');

});
