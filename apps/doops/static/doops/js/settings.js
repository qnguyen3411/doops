console.log("HELLO ORLD")

$( document ).ready(function() {


    function handler1() {
        console.log("HEY")
        $('#nav-menu a').css('width', 70);
        $(this).one("click", handler2);
    }
    function handler2() {
        console.log("HO")
        $('#nav-menu a').css('width', 0);
        $(this).one("click", handler1);
    }
    $("i").one("click", handler1);



    // $('#searchToggle').click(function(){
    //     $('#menu').hide()
    //     $('#searchform').slideToggle()
    //     $('#dashboard-window').animate({scrollTop:0}, 1)
        
    // });
    $('#form-choice a').click(function(){
        
        $(this).parent().children().removeClass('selected').addClass('text-disabled');
        $(this).addClass('selected').removeClass('text-disabled');

        href = $(this).attr('href');
        $('form').hide()
        $(href).show()
        console.log(href)
        
    });
    $('form').hide();
    $('#update_info').show();
    
    // $('#searchbox').hide()

});