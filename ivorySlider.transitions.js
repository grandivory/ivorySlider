(function($) {
  $.ivorySlider.effects.fade = function(vars, fromSlide, toSlide) {
    slider = this;
    fromSlide.fadeOut({
      duration: vars.speed,
      easing: vars.easing,
      complete: function() {
        toSlide.fadeIn({
          duration: vars.speed,
          easing: vars.easing,
          complete: function() {
            slider.finishedTransition();
          }
        });
      }
    });
  };
  $.ivorySlider.effects.crossFade = function(vars, fromSlide, toSlide) {
    slider = this;
    var startPos, endPos;

    if (slider.currentSlide < slider.lastSlide) {
      startPos = -this.height();
      endPos = 0;
    } else {
      startPos = 0;
      endPos = -this.height();
    }

    //Set up the display the way we want it
    fromSlide.css({
      display: 'block',
      'z-index': 1
    });
    toSlide.css({
      display: 'block',
      'z-index': 2
    });

    fromSlide.css({
      position: 'relative',
      top: startPos
    });
    toSlide.hide().css({
      position: 'relative',
      top: endPos
    });

    fromSlide.fadeOut({
      duration: vars.speed,
      easing: vars.easing
    });
    toSlide.fadeIn({
      duration: vars.speed,
      easing: vars.easing,
      complete: function() {
        fromSlide.hide();
        fromSlide.css({top: 0});
        toSlide.css({top: 0});
        slider.finishedTransition();
      }
    });
  };
  $.ivorySlider.effects.slide = function(vars, fromSlide, toSlide) {
    slider = this;
    var startPos,
      endPos,
      fromDirection,
      toDirection,
      posCss,
      fromOffsetSelector,
      toOffsetSelector,
      direction;

    direction = toSlide.attr('data-ivorySlider-direction') ? toSlide.attr('data-ivorySlider-direction') : vars.direction;

    if (slider.currentSlide < slider.lastSlide) {
      startPos = direction === 'horizontal' ? -this.width() : -this.height();
      endPos = 0;
      fromDirection = '+';
      toDirection = '-';
    } else {
      startPos = 0;
      endPos = direction === 'horizontal' ? -this.width() : -this.height();
      fromDirection = '-';
      toDirection = '+';
    }

    posCss = direction === 'horizontal' ? 'left' : 'top';

    this.css(posCss, startPos);

    fromOffsetSelector = fromSlide.attr('data-ivorySlider-offset-elements') ? fromSlide.attr('data-ivorySlider-offset-elements') : vars.offsetElements;
    toOffsetSelector = toSlide.attr('data-ivorySlider-offset-elements') ? fromSlide.attr('data-ivorySlider-offset-elements') : vars.offsetElements;


    if (direction === 'horizontal') {
      fromSlide.css({display: 'inline-block', 'vertical-align': 'top'});
      toSlide.css({display: 'inline-block', 'vertical-align': 'top'});
    } else {
      fromSlide.css({display: 'block'});
      toSlide.css({display: 'block'});
    }

    if (fromOffsetSelector || toOffsetSelector) {
      fromElements = fromOffsetSelector ? $(fromOffsetSelector, fromSlide) : [];
      toElements = toOffsetSelector ? $(toOffsetSelector, toSlide) : [];
      if (fromElements.length > 0) {
        var offsetIndex = fromElements.length - 1,
          offsetValue = fromSlide.attr('data-ivorySlider-offset-value') ? fromSlide.attr('data-ivorySlider-offset-value') : vars.offsetValue,
          offsetTime = fromSlide.attr('data-ivorySlider-offset-time') ? fromSlide.attr('data-ivorySlider-offset-time') : vars.offsetTime,
          offsetEasing = fromSlide.attr('data-ivorySlider-offset-easing') ? fromSlide.attr('data-ivorySlider-offset-easing') : vars.offsetEasing;
        fromElements.each(function() {
          var fromCssObject, toCssObject;
          fromCssObject = {
            position: 'relative',
            left: 0,
            top: 0
          };

          toCssObject = {left: 0, top: 0};
          toCssObject[posCss] = fromDirection + offsetValue;

          $(this).css(fromCssObject);
          $(this).stop().delay(offsetTime * offsetIndex--).animate(toCssObject, {
            duration: vars.speed,
            easing: offsetEasing,
            complete: function(){
              $(this).css(fromCssObject);
            }
          });
        });
      }

      if (toElements.length > 0) {
        var offsetIndex = 0,
          offsetValue = fromSlide.attr('data-ivorySlider-offset-value') ? fromSlide.attr('data-ivorySlider-offset-value') : vars.offsetValue,
          offsetTime = fromSlide.attr('data-ivorySlider-offset-time') ? fromSlide.attr('data-ivorySlider-offset-time') : vars.offsetTime,
          offsetEasing = fromSlide.attr('data-ivorySlider-offset-easing') ? fromSlide.attr('data-ivorySlider-offset-easing') : vars.offsetEasing;
        toElements.each(function() {
          fromCssObject = {
            position: 'relative',
            left: 0,
            top: 0
          };
          fromCssObject[posCss] = toDirection + offsetValue;

          toCssObject = {top: 0, left: 0};

          $(this).css(fromCssObject);
          $(this).stop().delay(offsetTime * offsetIndex++).animate(toCssObject, {
            duration: vars.speed,
            easing: offsetEasing
          });
        });
      }
    }

    cssObject = {};
    cssObject[posCss] = endPos;
    this.animate(cssObject, {
      duration: vars.speed,
      easing: vars.easing,
      complete: function() {
        slider.css({
          left: 0,
          top: 0
        });
        fromSlide.hide();
        slider.finishedTransition();
      }
    });
  };
}(jQuery));