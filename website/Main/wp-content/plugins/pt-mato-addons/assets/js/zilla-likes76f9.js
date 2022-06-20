jQuery(function (jQuery) {

  jQuery(document).on('click', '.zilla-likes', function () {
    var link = jQuery(this);
    if (link.hasClass('active')) return false;

    var id = jQuery(this).attr('data-id'),
      postfix = link.attr('data-postfix');

    jQuery.ajax({
      type: 'POST',
      url: zilla_likes.ajaxurl,
      data: {
        action: 'zilla-likes',
        likes_id: id,
        postfix: postfix,
      },
      xhrFields: {
        withCredentials: true,
      },
      success: function (data) {
        console.log(data);
        link.addClass('active').attr('title', 'You already like this').find('span').html(data+postfix);
      },
    });

    return false;
  });

  if (jQuery('body.ajax-zilla-likes').length) {
    jQuery('.zilla-likes').each(function () {
      var id = jQuery(this).attr('data-id');
      jQuery(this).load(zilla_likes.ajaxurl, {
        action: 'zilla-likes',
        post_id: id,
      });
    });
  }
});