function yprm_uniqid(pr, en) {
  var pr = pr || '',
    en = en || false,
    result, us;

  var seed = function (s, w) {
    s = parseInt(s, 10).toString(16);
    return w < s.length ? s.slice(s.length - w) :
      (w > s.length) ? new Array(1 + (w - s.length)).join('0') + s : s;
  };

  result = pr + seed(parseInt(new Date().getTime() / 1000, 10), 8) +
    seed(Math.floor(Math.random() * 0x75bcd15) + 1, 5);

  if (en) result += (Math.random() * 10).toFixed(8).toString();

  return result;
};

function circle_navigation($el, dir) {
  var deg_outer = parseInt($el.attr('data-deg'));

  if (dir == 'left') {
    deg_outer = deg_outer - 25.5;
    deg_inner = deg_outer - 4.5;
  } else {
    deg_outer = deg_outer + 25.5;
    deg_inner = deg_outer - 4.5;
  }

  $el.attr('data-deg', deg_outer).find('.d .c-outer').css({
    "-webkit-transform": "rotate(" + deg_outer + "deg)",
    "-moz-transform": "rotate(" + deg_outer + "deg)",
    "-ms-transform": "rotate(" + deg_outer + "deg)",
    "transform": "rotate(" + deg_outer + "deg)",
  }).prev().css({
    "-webkit-transform": "rotate(" + deg_inner + "deg)",
    "-moz-transform": "rotate(" + deg_inner + "deg)",
    "-ms-transform": "rotate(" + deg_inner + "deg)",
    "transform": "rotate(" + deg_inner + "deg)",
  });
}

function control_video($video_block, event) {
  $video_block.each(function () {
    let $item = jQuery(this),
      video = $item.find('video'),
      type = $item.attr('data-type');

    if (type == 'youtube') {
      video = window.youtube_players[$item.attr('data-uniqid')];
      if (typeof video === 'undefined') {
        video = yprm_load_youtube_video($item, event, {
          quality: $item.attr('data-quality'),
          muted: $item.attr('data-muted')
        });
      } else {
        if (event == 'play') {
          video.play();
        } else if (event == 'pause') {
          video.pause();
        } else if (event == 'mute') {
          video.muted = true;
        } else if (event == 'unmute') {
          video.muted = false;
        }
      }

    } else {
      video.each(function (index, item) {
        if (event == 'play') {
          video.muted = false;
          item.play();
        } else if (event == 'pause') {
          item.pause();
        }

        if (event == 'mute') {
          video.muted = true;
        } else if (event == 'unmute') {
          video.muted = false;
        }

        if(item.paused && event == 'play') {
          setTimeout(function() {
            item.play();
          }, 1000)
        }
      })
    }
  });
}

jQuery.fn.extend({
  toggleAttr: function (attr, a, b) {
    return this.attr(attr, this.attr(attr) == b ? a : b);
  }
});

function item_animation_delay() {
  var item_top = item_delay = 0;
  jQuery('.blog-item .wrap, .portfolio-block .wpb_animate_when_almost_visible').each(function () {
    var top = jQuery(this).offset().top;

    if (top == item_top) {
      item_delay = item_delay + 300;
    } else {
      item_top = top;
      item_delay = 0
    }

    if (item_delay != 0) {
      jQuery(this).css('animation-delay', item_delay + 'ms');
    }
  });
}

item_animation_delay();

function yprm_load_youtube_video($this, event, atts) {
  if (typeof event === 'undefined') {
    let event = '';
  }
  if (typeof atts === 'undefined') {
    let atts = [];
  }
  let video_id = $this.attr('data-id'),
    uniqid = $this.attr('data-uniqid');

  let quality = atts.quality;

  if (quality == '1440p') {
    quality = 'hd1440';
  } else if (quality == '1080p') {
    quality = 'hd1080';
  } else {
    quality = 'hd720';
  }

  let player = youtube({
    el: $this.get(0),
    id: video_id,
    modestbranding: true,
    iv_load_policy: 3,
    controls: false,
    disabledkb: false,
    showInfo: false,
    loop: true,
    rel: false,
    playlist: false,
    playsinline: true,
    list: false
  });

  player.addEventListener('ready', function () {
    let uniqid = yprm_uniqid(),
    iframe = player.getIframe();

    jQuery(iframe).attr('data-uniqid', uniqid);
    window.youtube_players[uniqid] = this;

    if (atts.muted == 'true') {
      this.muted = true;
    } else {
      this.muted = false;
    }
    if (jQuery(iframe).hasClass('disable-on-scroll') || event == 'pause') {
      this.pause();
    } else if (event == 'play') {
      this.play();
    }
  });

  player.addEventListener('ended', function () {
    player.play();
  });

  return player;
}

function yprm_calc_video_width($this) {
  let $video = jQuery($this),
    $container = $video.parent(),
    $width = $container.width(),
    $height = $container.height(),
    ratio = 16 / 9,
    coef = $width / $height;

  if (coef < 16 / 9) {
    $video.css({
      width: $height * ratio
    });
  } else {
    $video.css({
      width: $width
    });
  }
}

jQuery(document).ready(function ($) {
  "use strict";

  window.youtube_players = [];

  jQuery('.bg-overlay [data-parallax="true"]').each(function () {
    var $this = jQuery(this),
      url = $this.data('image-src');

    $this.parallax({
      imageSrc: url,
      mirrorContainer: $this.parent(),
      overScrollFix: true
    });
  });

  /* Document On Click */

  jQuery(document)
    .on('click', '.filter-block .filter-buttons .button:not(.current)', function () {
      var $grid = jQuery(this).parents('.filter-block').find('.isotope'),
        $button = jQuery(this).parents('.filter-block').find('.loadmore-button');

      if ($grid.length == 0 || $button.hasClass('loading')) return;

      jQuery(this).addClass('current').siblings().removeClass('current');

      var filterValue = jQuery(this).attr('data-filter');
      if ($button.length > 0) {
        jQuery(this).parents('.filter-block').find('.loadmore-button').trigger('click', [false]);
      } else {
        $grid.isotope({
          filter: filterValue
        });
      }

      jQuery(window).trigger('resize').trigger('scroll');
    })
    /* Filter Buttons */
    .on('click', '.blog-items .filter-buttons .button:not(.current)', function () {
      var $grid = jQuery(this).parents('.filter-buttons').next('.isotope');

      if ($grid.length == 0) return;

      jQuery(this).addClass('current').siblings().removeClass('current');

      var filterValue = jQuery(this).attr('data-filter');
      $grid.isotope({
        filter: filterValue
      });

      jQuery(window).trigger('resize').trigger('scroll');
    })
    /* BG Overlay Video */
    .on('click', '.bg-overlay a[data-video="true"]', function (e) {
      e.preventDefault();
      var $video = jQuery(this).parent().find('.video'),
        url = $video.attr('data-video-url'),
        type = $video.attr('data-video-type'),
        video = jQuery('<video />', {
          id: 'video',
          src: url,
          type: type,
          playsinline: true,
          autoplay: true,
          muted: true,
          loop: true,
        });

      $video.find('video').get(0).play();
      $video.parents('.banner-area').addClass('plaing-video');
    })
    .on('click', '.bg-overlay .close', function () {
      e.preventDefault();
      var $video = jQuery(this).parent().find('.video');

      $video.find('video').fadeOut(400, function () {
        jQuery(this).remove();
      });
      $video.parents('.banner-area').removeClass('plaing-video');
    });

  jQuery(window).scroll(num_scr);

  /* Resize Events */

  jQuery(window).on('load resize', function () {
    var window_width = jQuery(window).width(),
      window_height = jQuery(window).height(),
      window_height_a = jQuery(window).height() - jQuery('.header-space:visible').height() - jQuery('#wpadminbar').height();

    jQuery('.banner-style2').each(function () {
      let $this = jQuery(this).find('.clippy-image');
      if(!$this.length) return;
      
      let $img_block = $this.find('> div'),
        $img = $this.find('div div'),
        top = $this.position().top,
        left = $img_block.position().left + $this.position().left,
        right = $this.parent().width() - left - $img_block.width(),
        bottom = $this.parent().height() - top - $img_block.height();

      $img.css({
        'top': -top,
        'left': -left,
        'right': -right,
        'bottom': -bottom,
      });
    });

    jQuery('.portfolio-carousel').each(function () {
      var $this = jQuery(this),
        $this_c = $this.next('.portfolio-carousel-full-with'),
        offset = window_width - $this_c.offset().left;

      $this.css('width', offset);
    });

    jQuery('.portfolio-slider-style2').each(function () {
      var $this = jQuery(this);

      $this.find('.swiper-slide').css('height', window_height_a / 2);
    });

    jQuery('.portfolio-slider-style2 .swiper-slide.with-content').each(function () {
      var $this = jQuery(this),
        h_height = $this.find('.heading-block').height() / 2;

      if ($this.hasClass('top')) {
        $this.find('.content').css('padding-bottom', h_height);
      } else {
        $this.find('.content').css('padding-top', h_height);
      }
    });

    jQuery('.portfolio-carousel-style3').each(function () {
      var $this = jQuery(this);

      $this.find('.swiper-wrapper').css('height', window_height_a)
        .find('.swiper-slide').css('height', window_height_a - 250);
    });

    jQuery('.bg-overlay iframe.video').each(function () {
      yprm_calc_video_width(this);
    });
  });

  jQuery(window).on('load scroll', function () {
    var scroll_top = jQuery(window).scrollTop(),
      window_height = jQuery(window).height();

    jQuery('.bg-overlay .video').each(function () {
      var top_offset = parseInt(jQuery(this).offset().top),
        height = parseInt(jQuery(this).height());

      if (!jQuery(this).parents('.banner-item').length > 0 && !jQuery(this).parents('.fn-bgs').length > 0) {
        if (scroll_top + window_height >= top_offset && scroll_top <= top_offset + height) {
          jQuery(this).addClass('is-playing');
          control_video(jQuery(this), 'play');
        } else {
          jQuery(this).removeClass('is-playing');
          control_video(jQuery(this), 'pause');
        }
      }
    });
  });

  function num_scr() {
    jQuery('.num-box .number').each(function () {
      var top = jQuery(document).scrollTop() + jQuery(window).height();
      var pos_top = jQuery(this).offset().top;
      if (top > pos_top) {
        var number = parseInt(jQuery(this).html());
        if (!jQuery(this).hasClass('animated')) {
          jQuery(this).addClass('animated').prop('Counter', 0).animate({
            Counter: number
          }, {
            duration: 3000,
            easing: 'swing',
            step: function (now) {
              jQuery(this).html(function (i, txt) {
                return txt.replace(/\d+/, Math.ceil(now));
              });
            }
          });
        }
      }
    });
  }

  jQuery(document).on('click', '.video-controls .pause, .play-video:not([data-type])', function () {
    var $this = jQuery(this),
      $video_block = $this.parents('.bg-overlay').find('.video');
    if ($video_block.attr('data-type') == 'youtube') {
      let event = 'pause';
      if ($this.hasClass('active')) {
        event = 'play';
      }
      $this.toggleClass('active');

      $video_block.addClass('show');

      control_video($video_block, event);
    } else {
      var mediaVideo = $this.parents('.bg-overlay').find('video').get(0);

      if ($this.hasClass('play-video')) {
        var strings = $this.attr('data-strings').split('||');
        $video_block.addClass('show');
        $this.toggleAttr('data-magic-cursor-text', strings[0], strings[1]);
        $this.parents('.bg-overlay').find('.video-controls').removeClass('hide');

      }

      if (mediaVideo.paused) {
        mediaVideo.play();
        $this.removeClass('active');
        $video_block.addClass('is-playing');
      } else {
        mediaVideo.pause();
        $this.addClass('active');
        $video_block.removeClass('is-playing');
      }
    }
  }).on('click', '.video-controls .mute', function () {
    var $this = jQuery(this),
      $video_block = $this.parents('.bg-overlay').find('.video');
    if ($video_block.attr('data-type') == 'youtube') {
      let event = 'mute';
      $this.toggleClass('active');
      if ($this.hasClass('active')) {
        event = 'unmute';
      }

      control_video($video_block, event);
    } else {
      var mediaVideo = $this.parents('.bg-overlay').find('video').get(0);

      if (mediaVideo.muted) {
        mediaVideo.muted = false;
        $this.addClass('active');
      } else {
        mediaVideo.muted = true;
        $this.removeClass('active');
      }
    }
  });

  jQuery('.filter-block').YPRMLoadMore();

  jQuery(document).on('click', '.popup-gallery .popup-item a, .single-popup-item', function (event) {
    if (jQuery(document).find('.pswp').length == 0) {
      jQuery(document).find('#page').append('<div class="pswp" tabindex="-1" role="dialog" aria-hidden="true"> <div class="pswp__bg"></div><div class="pswp__scroll-wrap"> <div class="pswp__container"> <div class="pswp__item"></div><div class="pswp__item"></div><div class="pswp__item"></div></div><div class="pswp__ui pswp__ui--hidden"> <div class="pswp__top-bar"> <div class="pswp__counter"></div><button class="pswp__button pswp__button--close" data-magic-cursor="link-small" title="Close (Esc)"></button> <button class="pswp__button pswp__button--share" data-magic-cursor="link-small" title="Share"></button> <button class="pswp__button pswp__button--fs" data-magic-cursor="link-small" title="Toggle fullscreen"></button> <button class="pswp__button pswp__button--zoom" data-magic-cursor="link-small" title="Zoom in/out"></button> <div class="pswp__preloader"> <div class="pswp__preloader__icn"> <div class="pswp__preloader__cut"> <div class="pswp__preloader__donut"></div></div></div></div></div><div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap"> <div class="pswp__share-tooltip"></div></div><button class="pswp__button pswp__button--arrow--left" data-magic-cursor="link-small" title="Previous (arrow left)"> </button> <button class="pswp__button pswp__button--arrow--right" data-magic-cursor="link-small" title="Next (arrow right)"> </button> <div class="pswp__caption"> <div class="pswp__caption__center"></div></div></div></div></div>');
    }

    var $pswp = jQuery(document).find('.pswp')[0];
    var image = [];

    if (!jQuery(this).hasClass('permalink')) {

      event.preventDefault();

      var image = [];
      if (jQuery(this).hasClass('single-popup-item')) {
        var $pic = jQuery(this);
      } else {
        var $pic = jQuery(this).parents('.popup-gallery');
      }

      var getItems = function () {
        var items = [],
          $el = '';
        if ($pic.hasClass('owl-carousel')) {
          $el = $pic.find('.owl-item:not(.cloned) .popup-item');
        } else if ($pic.find('.swiper-container').length > 0) {
          $el = $pic.find('.popup-item:not(.swiper-slide-duplicate)');
        } else if ($pic.hasClass('single-popup-item')) {
          $el = $pic;
        } else {
          $el = $pic.find('.popup-item');
        }

        $el.each(function () {
          var $el = jQuery(this).find('a:not(.permalink)');
          if (jQuery(this).hasClass('single-popup-item')) {
            $el = jQuery(this);
          }
          var $href = $el.attr('href'),
            $size = $el.attr('data-size').split('x'),
            $width = $size[0],
            $height = $size[1];

          if ($el.attr('data-type') == 'video') {
            var item = {
              html: $el.attr('data-video')
            };
          } else {
            var item = {
              src: $href,
              w: $width,
              h: $height
            }
          }

          items.push(item);
        });
        return items;
      }

      var items = getItems();

      jQuery.each(items, function (index, value) {
        image[index] = new Image();
        if (value['src']) {
          image[index].src = value['src'];
        }
      });

      var $index = jQuery(this).parents('.popup-item').index();

      if (jQuery(this).hasClass('single-popup-item')) {
        $index = 1;
      }
      if (jQuery(this).parent().hasClass('thumbnails')) {
        $index++;
      }
      if (jQuery(this).parents('.popup-gallery').find('.grid-sizer').length > 0) {
        $index = $index - 1;
        if (jQuery(this).parents('.popup-gallery').find('.grid-sizer + .hidden').length > 0) {
          $index = $index - 1;
        }
      }
      if ($pic.hasClass('owl-carousel') || $pic.hasClass('.portfolio-items') || jQuery(this).data('id')) {
        $index = jQuery(this).data('id') - 1;
      }
      var options = {
        index: $index,
        bgOpacity: 0.7,
        showHideOpacity: true
      }

      var lightBox = new PhotoSwipe($pswp, PhotoSwipeUI_Default, items, options);
      lightBox.init();

      lightBox.listen('beforeChange', function () {
        var currItem = jQuery(lightBox.currItem.container);
        jQuery('.pswp__item .pswp__video').removeClass('active');
        var currItemIframe = currItem.find('.pswp__video').addClass('active');
        jQuery('.pswp__item .pswp__video').each(function () {
          if (!jQuery(this).hasClass('active')) {
            jQuery(this).attr('src', jQuery(this).attr('src'));
          }
        });

        /* jQuery('.pswp__item video.pswp__video').each(function() {
          if(jQuery(this).hasClass('active')) {
            jQuery(this).get(0).play();
          } else {
            jQuery(this).get(0).pause();
          }
        }); */
      });

      lightBox.listen('close', function () {
        jQuery('.pswp__item .pswp__zoom-wrap').remove();
      });
    }
  });
});

(function (jQuery) {
  "use strict";
  jQuery.fn.YPRMLoadMore = function (options) {

    function rebuild_array(src, filt) {
      var result = [];

      for (let index = 0; index < src.length; index++) {
        let id = src[index].id || src[index].uniqid,
          flag = false;
        for (let index2 = 0; index2 < filt.length; index2++) {
          let id2 = filt[index2].id || filt[index2].uniqid;
          if (id == id2) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          result.push(src[index]);
        }
      }

      return JSON.stringify(result);
    }

    function getFromCategory(array, slug, count, return_type) {
      var result = [],
        i = 0;

      for (let index = 0; index < array.length; index++) {
        let flag = false;

        if (typeof array[index].cat === undefined || typeof array[index].cat === 'undefined') continue;

        for (let index2 = 0; index2 < array[index].cat.length; index2++) {

          if (array[index].cat[index2] == slug) {
            flag = true;
            break;
          }
        }
        if (flag) {
          i++;
          result.push(array[index]);
        }

        if (i == count && !return_type) {
          break;
        }
      }

      if (result == []) {
        return false;
      }

      return result;
    }

    return this.each(function () {
      var $this = jQuery(this),
        $button = $this.find('.loadmore-button'),
        $filter = $this.find('[class^="filter-butt"]'),
        $items = $this.find('.load-wrap'),
        type = $button.attr('data-type'),
        action = 'loadmore_' + $button.attr('data-action'),
        count = $button.attr('data-count'),
        style = $button.attr('data-style'),
        scrollTop = 0;

      $this.append('<div class="load-items-area"></div>');

      $items.css('min-height', $items.find('.item').height());

      $button.on('click', function (event, loading) {
        if (jQuery(this).hasClass('loading')) return false;

        scrollTop = jQuery(window).scrollTop();

        if (typeof loading === 'undefined' || loading === undefined) {
          loading = true;
        }

        var array = JSON.parse($button.attr('data-array')),
          atts = JSON.parse($button.attr('data-atts')),
          load_items = array.slice(0, count),
          filter_value = '*';

        if ($filter.length > 0) {
          var filter_value = $filter.find('.current').attr('data-filter'),
            slug = filter_value.replace('.category-', ''),
            current_count = $items.find(filter_value).length;

          if (filter_value != '*') {
            var cat_full_length = getFromCategory(array, slug, count, true).length,
              cat_length = getFromCategory(array, slug, count, false).length;

            if (current_count < count && cat_full_length != 0) {
              load_items = getFromCategory(array, slug, count - current_count, false);
              loading = true;
            } else if (loading) {
              load_items = getFromCategory(array, slug, count, false);
            }

            if ((loading && cat_full_length - load_items.length <= 0) || (!loading && cat_full_length == 0)) {
              $button.fadeOut();
            } else {
              $button.fadeIn();
            }
          } else {
            $button.fadeIn();
          }

          $items.isotope({
            filter: filter_value
          });
        }

        if (!loading) {
          return false;
        }

        $button.addClass('loading');

        jQuery.ajax({
          url: yprm_ajax.url,
          type: "POST",
          data: {
            action: action,
            array: load_items,
            atts: atts,
            type: type,
            style: style,
            start_index: $this.find('article').length
          },
          success: function (data) {
            var temp_block = $this.find('.load-items-area').append(data);
            array = rebuild_array(array, load_items);

            temp_block.imagesLoaded(function () {

              var items = temp_block.find('article');

              if ($items.hasClass('isotope')) {
                $items.append(items).isotope('appended', items).isotope({
                  filter: filter_value
                }).queue(function (next) {

                  $button.attr('data-array', array).removeClass('loading');

                  jQuery(this).find('.wpb_animate_when_almost_visible:not(.wpb_start_animation)').each(function () {
                    var $el = jQuery(this);

                    $el.vcwaypoint(function () {
                      $el.addClass("wpb_start_animation animated")
                    }, {
                      offset: "85%"
                    });
                  });

                  if(scrollTop < jQuery(window).scrollTop()) {
                    jQuery('body, html').animate({
                      scrollTop: scrollTop
                    }, 1100);
                  }

                  jQuery(window).trigger('resize').trigger('scroll');
                  next();
                });
              } else {
                $items.append(items).queue(function (next) {
                  $button.attr('data-array', array).removeClass('loading');

                  jQuery(this).find('.wpb_animate_when_almost_visible:not(.wpb_start_animation)').each(function () {
                    var $el = jQuery(this);

                    $el.vcwaypoint(function () {
                      $el.addClass("wpb_start_animation animated")
                    }, {
                      offset: "85%"
                    });
                  });

                  if(scrollTop < jQuery(window).scrollTop()) {
                    jQuery('body, html').animate({
                      scrollTop: scrollTop
                    }, 1100);
                  }
                  
                  jQuery(window).trigger('resize').trigger('scroll');
                  next();
                });
              }

            });

            if (array == '[]') {
              $button.parent().slideUp();
            }
          },
          error: function (errorThrown) {
            console.log(errorThrown);
          }
        });
      });
    });
  };

})(jQuery);