/*global $ */

$(function(){
  //a choice is clicked
  $('section.choices ul li').on('click', function(){
    var clicked_obj = this;
    //stop other choices from being clicked
    $('section.choices ul li').off('click').removeClass('active');

    $.post('/ajax',{handle: $(this).attr('data-handle')}, function(data){
      if (data.response === 'correct'){
        $(clicked_obj).addClass('correct');
        //update the score
        $('#score .correct').html(data.new_score);

        //load new question
        window.setTimeout(
          function () {
            window.location.reload(true);
          }, 500);

      } else if (data.response === 'incorrect'){
        $(clicked_obj).addClass('incorrect');
        //mark the correct answer as green
        $('.choices li[data-handle="' + data.correct_handle + '"]').addClass('correct');
        //update the score
        $('#score .incorrect').html(data.new_score);

        //load new question
        window.setTimeout(
          function () {
            window.location.reload(true);
          }, 500);

      } else {
        //assume an error
        window.location.reload(true);
      }
    });
  });
});
