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

    // $("timeline-control").click(function(){
    //     $.ajax({
    //         method : "POST",
    //         url: "/get_nodes",
    //         data: {
    //             mode : $(this).attr('mode'),
    //             mode : $(this).attr('mode'),
    //         }
    //     })
    // })
    // $('#searchbox').hide()


});