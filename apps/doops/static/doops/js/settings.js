
$( document ).ready(function() {

    // $('#searchToggle').click(function(){
    //     $('#menu').hide()
    //     $('#searchform').slideToggle()
    //     $('#dashboard-window').animate({scrollTop:0}, 1)
        
    // });
    $('#form-choice a').click(function(){
        
        $(this).parent().children().removeClass('selected').addClass('text-default');
        $(this).addClass('selected').removeClass('text-default');

        href = $(this).attr('href');
        $('form').addClass('d-none')
        $(href).removeClass('d-none')
        console.log(href)
        return false;
    });
    $('#update_info').show();
    
    // $('#searchbox').hide()

});