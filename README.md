#BackgroundCheck

Automatically switch to a darker or a lighter version of an element depending on the brightness of images behind it.

**Examples**

+ [Project Page](http://kennethcachia.com/background-check/)
+ [Slider](http://kennethcachia.com/background-check/slider.html)
+ [Fixed Nav](http://kennethcachia.com/background-check/fixed-nav.html)
+ [CSS Backgrounds](http://www.kennethcachia.com/background-check/css-backgrounds.html)
+ [CSS Backgrounds &mdash; Fullscreen](http://www.kennethcachia.com/background-check/css-backgrounds-fullscreen.html)
+ [Cross-Origin Request](http://www.kennethcachia.com/background-check/cross-origin.html)

**Using BackgroundCheck with other plugins**

+ [FlexSlider &mdash; Slide](http://www.kennethcachia.com/background-check/flexslider.html)
+ [FlexSlider &mdash; Fade](http://www.kennethcachia.com/background-check/flexslider-fade.html)

##How it works

If an element overlaps any of the images, either `.background--dark` or `.background--light` is added to it. BackgroundCheck does not change an element's style &mdash; you must do so using CSS.

For example, if `<p>` has the following default style:

```css
p {
  color: white;
}
```

you can then add the following:

```css
p.background--light {
  color: black;
}
```

Classes are only added if the element overlaps an image. An element is considered to overlap an image if at least 50% (configurable) of it's area is covering that image.

###Complex backgrounds

The light and dark classes work well with simple backgrounds, but you might require an additional level of control for elaborate backgrounds. BackgroundCheck adds `.background--complex` to an element if its background exceeds a certain level of complexity.

This class can be used as an intermediate state:

```css
p.background--light {
  color: black;
}

p.background--dark {
  color: white;
}

p.background--complex {
  color: gray;
}
```

or:

```css
p.background--dark.background--complex {
  color: #ccc;
}

p.background--light.background--complex {
  color: #aaa;
}
```

##How to use

**Initialize**

```javascript
// Check all elements with a .target class against all images on a page
BackgroundCheck.init({
  targets: '.target'
});

// Specific images
BackgroundCheck.init({
  targets: '.target',
  images: '.thumbnails'
});
```

**Reprocess**

```javascript
// All targets
BackgroundCheck.refresh();

// Specific target
BackgroundCheck.refresh(target);
```

**Setters and getters**

```javascript
// Get current targets
BackgroundCheck.get('targets');

// Change targets
BackgroundCheck.set('targets', '.header');
```

**Stop**

```javascript
BackgroundCheck.destroy();
```

##Attributes

Used with `.init()`, `.set()` or `.get()`

+ **targets**: Elements to be processed. *Type:* String, Element or Nodelist. *Required*.
+ **images**: Images to be used. *Type:* String, Element or NodeList. *Default:* All images on page.
+ **changeParent**: Determines if classes are added to a target or to its parent. *Default:* false.
+ **threshold**: Midpoint between dark and light. *Default:* 50 (%).
+ **minComplexity**: Minimum image complexity required before the *complex* class is added to a target. *Default:* 30 (%).
+ **minOverlap**: Minimum overlap required between an element and any of the images for that element to be processed. *Default:* 50 (%).
+ **classes**: Classes added to targets. *Default:* `{ dark: 'background--dark', light: 'background--light', complex: 'background--complex' }`
+ **windowEvents**: Reprocess on window resize and scroll. *Default:* true.
+ **maxDuration**: Maximum processing time allowed. Killed if it takes longer. *Default:* 500 (ms).
+ **mask**: Used internally when checking if an element overlaps any of the images. *Default:* `{ r: 0, g: 255, b: 0 }`
+ **debug**: Enable or disable logs. *Default*: false.

##CSS Backgrounds

BackgroundCheck can also be used on an element that has a `background-image`. For example:

```css
.thumbnail {
  background-image: url(image.jpg);
}
```

```js
BackgroundCheck.init({
  targets: '.target',
  images: '.thumbnail'
});
```

**Background Position and Size**

Tested with the following units:

+ `background-size`: cover, contain, auto, inherit, cm, em, px and %
+ `background-position`: top, left, center, right, bottom, inherit, cm, em, px and %

**Current Limitations**

+ `background-repeat` is not supported and is forced to `no-repeat`
+ `background-origin` is forced to `padding-box`
+ Multiple backgrounds are not supported
+ Four-value syntax can be used if the browser [supports it](https://developer.mozilla.org/en-US/docs/Web/CSS/background-position#Specifications)

##Browser Support

Tested on IE 9-11, iOS 6/7 and the latest versions of Chrome, Firefox and Safari.