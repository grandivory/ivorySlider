(function($){
  $(function(){
    $('.tabs a').click(function(){
      $('.tabs a').removeClass('active');
      $(this).addClass('active');

      $('.tab').hide();
      $('.tab'+$(this).attr('href')).show();

      return false;
    });
  });
}(jQuery));