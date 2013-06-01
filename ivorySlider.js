(function($) {

  //This is the ivorySlider class that will be instantiated when a slider is created
  $.ivorySlider = function(el, options) {
    var slider = $(el),
      vars = $.extend({}, $.ivorySlider.defaults, options),
      methods = {};

    //Set the slider as jQuery data so it can be retrieved later
    $.data(el, 'ivorySlider', slider);

    //Private methods
    methods = {
      init: function() {
        slider.wrap('<div class="ivorySlider-wrapper">');
        slider.wrapper = slider.parent();
        slider.wrapper.wrap('<div class="ivorySlider">');
        if (slider.css('position') === 'static') {
          slider.css('position', 'relative');
        }

        slider.animating = false;
        slider.currentSlide = vars.startSlide;
        slider.slides = $(vars.slideSelector, slider);
        slider.addClass('ivorySlider-slider');
        slider.slides.addClass('ivorySlider-slide');

        //Set up navigation and controls
        methods.pageNav.setup();
        methods.controls.setup();

        //Hide all but the current slide
        slider.slides.filter(':not(:eq(' + slider.currentSlide + '))').hide();

        //Initialize the timer
        slider.timer = new methods.slideTimer();

        if (vars.autoplay) {
          slider.timer.setTimer(slider.next, vars.slideDuration);
        }

        //Callback function for when the slider is ready
        vars.ready();
      },
      pageNav: {
        setup: function() {
          //Either
          //1) the href attributes of these links match up to the IDs of each slide,
          //or 2) there are the same number of objects as slides
          var slideLinks;
          if (typeof vars.pageNav === "string") {
            slideLinks = $(vars.pageNav, slider);
          } else if (typeof vars.pageNav === "object") {
            slideLinks = vars.pageNav;
          } else if (vars.pageNav === true) {
            //Create page navigation and add it to the container
            pageNavContainer = $('<div class="ivorySlider-page-nav">').insertBefore(slider.wrapper);
            for (i = 0; i < slider.slides.length; i++) {
              $('<a href="#" class="ivorySlider-page-nav-slide-' + i + '"></a>').appendTo(pageNavContainer);
            }

            slideLinks = $('.ivorySlider-page-nav a');
          }

          //If we don't have any page navigation at this point, we're done
          if (typeof slideLinks === "undefined")
            return;

          slider.pageNav = slideLinks;
          if (slideLinks.length === slider.slides.length) {
            slideLinks.unbind('click').click(function() {
              vars.autoplay = false;
              slider.slideTo(slideLinks.index($(this)));
              return false;
            });
          }

          //Make sure that the current slide is set to active in page navigation
          slideLinks.removeClass('active');
          slideLinks.eq(vars.startSlide).addClass('active');
        }
      },
      controls: {
        setup: function() {
          var nextLink = prevLink = playLink = pauseLink = $();

          if (true === vars.arrows || true === vars.playControls) {
            controlsContainer = $('<div class="ivorySlider-controls">').insertAfter(slider.wrapper);

            if (true === vars.playControls) {
              playLink = $('<a href="#" class="play"></a>').appendTo(controlsContainer);
              pauseLink = $('<a href="#" class="pause"></a>').appendTo(controlsContainer);
            }

            if (true === vars.timer) {
              timer = $('<div class="ivorySlider-timer-wrapper"><div class="ivorySlider-timer-bar"></div></div>').appendTo(controlsContainer);
              slider.timerBar = timer.find('.ivorySlider-timer-bar');
            } else {
              slider.timerBar = false;
            }

            if (true === vars.arrows) {
              //Create directional navigation and add it outside the container
              prevLink = $('<a href="#" class="prev"></a>').prependTo(controlsContainer);
              nextLink = $('<a href="#" class="next"></a>').appendTo(controlsContainer);
            }
          }

          //This code could probably be cleaned up a bit
          //Allow for user-defined controls
          switch (typeof vars.prevButton) {
            case "string":
              prevLink.add($(vars.prevButton, slider));
              break;
            case "object":
              prevLink.add(vars.prevButton);
              break;
          }
          switch (typeof vars.nextButton) {
            case "string":
              nextLink.add($(vars.nextButton, slider));
              break;
            case "object":
              nextLink.add(vars.nextButton);
              break;
          }
          switch (typeof vars.playButton) {
            case "string":
              playLink.add($(vars.playButton, slider));
              break;
            case "object":
              playLink.add(vars.playButton);
              break;
          }
          switch (typeof vars.pauseButton) {
            case "string":
              pauseLink.add($(vars.pauseButton, slider));
              break;
            case "object":
              pauseLink.add(vars.pauseButton);
              break;
          }

          prevLink.unbind('click').click(function() {
            vars.autoplay = false;
            slider.prev();
            return false;
          });
          nextLink.unbind('click').click(function() {
            vars.autoplay = false;
            slider.next();
            return false;
          });
          playLink.unbind('click').click(function() {
            slider.play();
            return false;
          });
          pauseLink.unbind('click').click(function() {
            slider.pause();
            return false;
          });
          if (slider.timerBar) {
            timer.click(function(){
              slider.timer.toggle();
            });
          }
        }
      },
      //The slide timer is a wrapper class built around the setTimeout function
      //It allows a single timeout function to be paused and resumed
      //It is instantiated once, then called multiple times
      slideTimer: function() {
        var timerId, start, remaining, onFinish;

        this.setTimer = function(callback, delay) {
          onFinish = callback;
          remaining = delay;
          this.resume();
        };
        this.pause = function() {
          vars.autoplay = false;
          clearTimeout(timerId);
          timerId = false;
          remaining -= new Date() - start;
          if (slider.timerBar) {
            slider.timerBar.stop();
          }
        };
        this.resume = function() {
          if (onFinish === undefined || remaining === undefined) {
            return false;
          }
          vars.autoplay = true;
          start = new Date();
          //Clear the timer if one already exists as we're losing the ID
          if (timerId) {
            clearTimeout(timerId);
          }
          timerId = setTimeout(onFinish, remaining);
          if (false !== slider.timerBar) {
            slider.timerBar.stop().animate({
              width: '100%'
            }, {
              duration: remaining,
              easing: 'linear'
            });
          }
          return true;
        };
        this.toggle = function() {
          if (timerId) {
            this.pause();
          } else {
            this.resume();
          }
        };
        this.stop = function() {
          vars.autoplay = false;
          this.clear();
        };
        this.clear = function() {
          clearTimeout(timerId);
          timerId = false;
          if (slider.timerBar) {
            slider.timerBar.stop().css({width: 0});
          }
          remaining = vars.slideDuration;
        };

        return this;
      }
    };

    //Public methods
    //By simply adding a method to the slider object, that method can be invoked
    //by using ivorySlider('method name') on the slider selector
    slider.next = function() {
      if (slider.animating)
        return;
      var nextSlide = slider.currentSlide + 1;
      if (nextSlide >= slider.slides.length) {
        if (vars.carousel) {
          nextSlide = 0;
        } else {
          return;
        }
      }

      slider.slideTo(nextSlide);
    };
    slider.prev = function() {
      if (slider.animating)
        return;
      var nextSlide = slider.currentSlide - 1;
      if (nextSlide < 0) {
        if (vars.carousel) {
          nextSlide = slider.slides.length - 1;
        } else {
          return;
        }
      }

      slider.slideTo(nextSlide);
    };
    slider.slideTo = function(index) {
      if (slider.animating)
        return;

      if (index !== slider.currentSlide) {
        slider.lastSlide = slider.currentSlide;
        slider.currentSlide = index;
        var fromSlide = slider.slides.eq(slider.lastSlide);
        var toSlide = slider.slides.eq(index);

        slider.timer.clear();

        vars.beforeChange(slider.lastSlide, index);

        //If a transition effect is specified on the slide we're going to, use
        //that transition effect over the default
        slider.animating = true;
        if (toSlide.attr('data-ivorySlider-effect') && $.ivorySlider.effects.hasOwnProperty(effect = toSlide.attr('data-ivorySlider-effect'))) {
          $.ivorySlider.effects[effect].apply(slider, [vars, fromSlide, toSlide]);
        } else if ($.ivorySlider.effects.hasOwnProperty(vars.effect)) {
          $.ivorySlider.effects[vars.effect].apply(slider, [vars, fromSlide, toSlide]);
        } else {
          //This is the 'no transition' effect - simply change the visible slide
          toSlide.show();
          fromSlide.hide();
          slider.finishedTransition();
        }

        slider.currentSlide = index;
        slider.pageNav.removeClass('active');
        slider.pageNav.eq(index).addClass('active');
      }
    };
    slider.options = function(options) {
      $.extend(vars, options);
    };
    slider.play = function() {
      vars.autoplay = true;
      if (slider.timerBar) {
        slider.timer.resume() || slider.timer.setTimer(slider.next, vars.slideDuration);
      } else {
        slider.next();
      }
      vars.onPlay();
    };
    slider.pause = function() {
      if (slider.timerBar) {
        slider.timer.pause();
      } else {
        slider.timer.stop();
      }
      vars.onPause();
    };
    slider.finishedTransition = function() {
      slider.animating = false;
      vars.afterChange(slider.lastSlide, slider.currentSlide);
      if (vars.autoplay) {
        slider.timer.setTimer(slider.next, vars.slideDuration);
      }
    };

    //Call the initialize method upon to finish instantiating the slider class
    methods.init();
  };

  //Transition effects
  //Each effect is passed the slides it is transitioning from and to as jQuery objects.
  //Within the function, {this} refers to the slider object, with the variables
  //lastSlide and currentSlide set to the indices of the "from" and "to" slides,
  //respectively.  The function must call slider.finishedTransition() when finished.
  //Function definition - effect: function(options, fromSlide, toSlide);
  $.ivorySlider.effects = {};

  //Default settings
  $.ivorySlider.defaults = {
    carousel: true, //Whether or not to wrap the slider between the first and last elements
    effect: 'crossFade', //Slide transition effect.  ['fade', 'crossFade', 'slide', 'none']
    speed: 'slow', //Slide transition speed.  ['slow', 'fast', or # in milliseconds]
    easing: 'swing', //Slide transition easing effect
    direction: 'horizontal', //Direction of motion for some slide transitions

    offsetElements: false, //For 'slide' transition, offset elements within the slide to come in at different rates. [false, string, jQuery objects]
    offsetValue: '500px', //Value by which to offset the slide elements
    offsetTime: 100, //Number of milliseconds by which each element is offset
    offsetEasing: 'swing', //Easing to use for the offset animation

    slideSelector: 'li', //Selector to find slides within the slider
    startSlide: 0, //Slide at which to start
    pageNav: false, //Slide pager. [string, jQuery objects, true]
    arrows: true, //Whether to auto-generate directional navigation arrows
    playControls: true, //Whether to auto-generate play/pause controls
    timer: false, //Whether to display a timer
    nextButton: false, //Button to use to increment the slider.  [string, jQuery objects]
    prevButton: false, //Button to use to decrement the slider.  [string, jQuery objects]
    playButton: false, //Button to use to auto-play the slider. [string, jQuery objects]
    pauseButton: false, //Button to use to pause the slider. [string, jQuery objects]
    autoplay: false, //Whether to automatically transition the slider
    slideDuration: 5000, //Duration to display each slide when auto-playing

    //Callback functions
    ready: function() {
    }, //Called after initialization
    beforeChange: function(from, to) {
    }, //Called before the slide changes
    afterChange: function(from, to) {
    }, //Called after a slide has finished transitioning
    onPlay: function() {
    }, //Called when the slider begins to play (but not at the beginning if autoplay is true)
    onPause: function() {
    } //Called when the slider is paused
  };

  //This is the ivorySlider function that will be called on the selected objects
  //Either it can be called with an options object or a public function can
  //be specified, along with arguments for that function
  $.fn.ivorySlider = function(options) {
    if (typeof options === "object" || options === undefined) {
      return this.each(function() {
        var $this = $(this);

        //Only create a new slider object if one has not already been created
        if ($this.data('ivorySlider') === undefined) {
          new $.ivorySlider(this, options);
        }
      });
    } else {
      sliderFunction = [].shift.apply(arguments);
      functionArgs = arguments;

      if (1 === this.length) {
        //If there is only one object this function is being called on, return
        //the value of the function
        var $slider = $.data(this.get(0), 'ivorySlider');
        return $slider[sliderFunction].apply($slider, functionArgs);
      } else {
        //If there are multiple objects, no value can be returned
        this.each(function() {
          var $slider = $.data(this, 'ivorySlider');
          $slider[sliderFunction].apply($slider, functionArgs);
        });
      }
    }
  };
}(jQuery));