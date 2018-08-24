console.log("HELLO ORLD")

$( document ).ready(function() {


        
    $('.watch-button').click(function(){
        var canvas_id = $(this).attr('canvasID')
        $(this).addClass('text-lightgreen')
        $(this).removeClass('text-disabled')
        $.ajax({
            method: "GET",
            url: "/watch/"+canvas_id,
            data: {},
            success: function(resp){
                var watch_selector = '#canvas-'+ canvas_id + " .watches" ;
                var total_watch_selector = '#canvas-'+ canvas_id + " .total-watches" ;

                $(''+watch_selector).html(resp['target_watch'].toString())
                $('#self-numwatch').html(resp['user_watch'].toString() + " Watches")
                for(var i = 0; i < resp['change_list'].length; i++){
                    total_watch_selector = '#canvas-'+ resp['change_list'][i]['id'] + " .total-watches"
                    $(''+total_watch_selector).html(resp['change_list'][i]['total_watch_num'].toString())
                }
            }
        })//end ajax
    }); //end watch button listener
    $('.notification-button').click(function(e){
        console.log(e.clientX)
        console.log(e.clientY)
        $('#notifications').css('top', e.clientY + 10 + $(window).scrollTop())
            .css('left', e.clientX + $(window).scrollLeft())
            .toggle()
    })

    $('#notifications li').click(function(){
        self_id = $(this).attr('selfID')
        noti_id = $(this).attr('notiID')
        console.log(self_id, noti_id)
        $.ajax({
            method: "POST",
            url: "/clear_notification",
            data: {
                user_id: self_id,
                noti_id: noti_id,
            },
            success: function(resp){
                console.log(resp)
            }
        })
        $(this).remove()

    })
    $(window).scroll(function(){
        $('#notifications').hide()
    })
    $('#notifications').hide()
});