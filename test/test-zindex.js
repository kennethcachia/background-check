
(function () {
  var image1 = wrapper.querySelector('.image--one');
  var image2 = wrapper.querySelector('.image--two');
  var image3 = wrapper.querySelector('.image--three');

  var fragmented = document.querySelector('.test--fragmented');
  var slide1 = fragmented.querySelector('.slide--one');
  var slide2 = fragmented.querySelector('.slide--two');
  var slide3 = fragmented.querySelector('.slide--three');

  // Convenience methods
  function reset() {
    wrapper.style.position = null;
    slide1.style.position = null;
    slide2.style.position = null;
    slide3.style.position = null;
    image1.style.position = image1.style.marginLeft = null;
    image2.style.position = image2.style.marginLeft = null;
    image3.style.position = image3.style.marginLeft = null;
  }

  function setSlideOrder(z1, z2, z3) {
    slide1.style.zIndex = z1;
    slide2.style.zIndex = z2;
    slide3.style.zIndex = z3;
  }

  function setImageOrder(z1, z2, z3) {
    image1.style.zIndex = z1;
    image2.style.zIndex = z2;
    image3.style.zIndex = z3;
  }

  function runTest(expected) {
    BackgroundCheck.refresh();
    deepEqual(BackgroundCheck.get('images'), expected, 'returns an array of images sorted as expected');
  }


  // Tests
  test('Test zIndex sorting - basic markup', function () {

    BackgroundCheck.init({
      targets: targets,
      images: '.test img',
      debug: true
    });

    setImageOrder('auto', 'auto', 'auto');
    runTest([image1, image2, image3]);

    setImageOrder(null, 'auto', null)
    runTest([image1, image2, image3]);

    setImageOrder(0, 'auto', 0)
    runTest([image1, image2, image3]);

    setImageOrder(1, -1, 2);
    runTest([image2, image1, image3]);

    setImageOrder(1, 3, 2);
    runTest([image1, image3, image2]);

    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    setImageOrder(1, 3, 2);
    runTest([image2, image1, image3]);

    reset();
    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    image3.style.position = 'static';
    image3.style.marginLeft = '-150px';
    setImageOrder(0, 300, 200);
    runTest([image2, image3, image1]);
    wrapper.style.position = 'static';
    runTest([image2, image3, image1]);

    reset();
    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    image3.style.position = 'static';
    image3.style.marginLeft = '-150px';
    setImageOrder(1, 300, 200);
    runTest([image2, image3, image1]);
    wrapper.style.position = 'static';
    runTest([image2, image3, image1]);

    reset();
    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    image3.style.position = 'static';
    image3.style.marginLeft = '-150px';
    setImageOrder(1000, 300, 200);
    runTest([image2, image3, image1]);
    wrapper.style.position = 'static';
    runTest([image2, image3, image1]);

    reset();
    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    image3.style.position = 'static';
    image3.style.marginLeft = '-150px';
    setImageOrder('auto', 300, 200);
    runTest([image2, image3, image1]);
    wrapper.style.position = 'static';
    runTest([image2, image3, image1]);

    reset();
    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    image3.style.position = 'static';
    image3.style.marginLeft = '-150px';
    setImageOrder(-1, 300, 200);
    runTest([image1, image2, image3]);
    wrapper.style.position = 'static';
    runTest([image1, image2, image3]);

  });


  // Tests
  test('Test zIndex sorting - fragmented markup', function () {

    // Switch to fragmented markup
    image1 = fragmented.querySelector('.image--one');
    image2 = fragmented.querySelector('.image--two');
    image3 = fragmented.querySelector('.image--three');

    BackgroundCheck.init({
      targets: '.test--fragmented .target',
      images: '.test--fragmented img'
    });

    reset();
    runTest([image1, image2, image3]);


    /*************************************
     * The 2nd test in this group (in this order) 
     * will fail if the document position is not 
     * checked while sorting
     *************************************/
    setImageOrder(3, 2000, 1);
    runTest([image3, image1, image2]);

    setSlideOrder(1, 1, 1);
    setImageOrder(null, null, null);
    runTest([image1, image2, image3]);
    /*************************************/


    setSlideOrder(3, 1, 2);
    setImageOrder(null, null, null);
    runTest([image2, image3, image1]);

    reset();
    setSlideOrder(3, 2, 1);
    setImageOrder(5, 6, 7);
    runTest([image3, image2, image1]);

    reset();
    setSlideOrder(3, 2, 1);
    setImageOrder(5000, 6000, 7000);
    runTest([image3, image2, image1]);

    reset();
    setSlideOrder(3, 2, 2);
    setImageOrder(5, 6, 7);
    runTest([image2, image3, image1]);

    reset();
    setSlideOrder(null, null, null);
    image3.style.position = 'static';
    image3.style.marginLeft = '240px';
    setImageOrder(2, 1, 100);
    runTest([image3, image2, image1]);

    reset();
    setSlideOrder(5, 4, 3);
    setImageOrder(null, null, null);
    image1.style.position = 'static';
    image2.style.position = 'static';
    image2.style.marginLeft = '100px';
    image3.style.position = 'static';
    image3.style.marginLeft = '200px';
    runTest([image3, image2, image1]);

    reset();
    setSlideOrder(null, null, null);
    setImageOrder(null, null, null);
    slide1.style.position = 'static';
    slide2.style.position = 'static';
    slide3.style.position = 'static';
    runTest([image1, image2, image3]);


    /* 
     * Current Limitations - the following
     * tests fail
    
    reset();
    setSlideOrder(null, null, null);
    setImageOrder(5, 4, 3);
    slide1.style.position = 'static';
    slide2.style.position = 'static';
    slide3.style.position = 'static';
    runTest([image3, image2, image1]);   -- Fails on IE

    reset();
    setSlideOrder(null, 100, null);
    setImageOrder(5, 4, 3);
    slide1.style.position = 'static';
    slide3.style.position = 'static';
    runTest([image3, image1, image2]);   -- Fails on IE

    reset();
    setSlideOrder(3, 2, 2);
    setImageOrder(5, 6, 7);
    image3.style.position = 'static';
    image3.style.marginLeft = '50px';
    runTest([image2, image3, image1]);   -- Fails
    */

  });

}());
