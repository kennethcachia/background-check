
test('Test light, dark and complex classes', function () {

  var target1 = wrapper.querySelector('.test .target--one');
  var target2 = wrapper.querySelector('.test .target--two');
  var callbackSpy = this.spy();

  BackgroundCheck.init({
    targets: '.test .target',
    images: '.test img',
    callback: callbackSpy
  })

  equal(target1.className, 'target target--one background--dark', 'correct classes are added');
  equal(target2.className, 'target target--two background--light background--complex', 'correct classes are added');
  ok(callbackSpy.calledTwice, 'callback is called once for each target');
  ok(callbackSpy.firstCall.calledWith(target1, 'dark', false), 'callback recieved the correct paramaters');
  ok(callbackSpy.secondCall.calledWith(target2, 'light', true), 'callback recieved the correct paramaters');

});
