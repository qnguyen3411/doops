$( document ).ready(function() {

    $('.notification-button').click(function(e){
        $('#notifications').css('top', e.clientY + 10 + $(window).scrollTop())
            .css('left', e.clientX + $(window).scrollLeft())
            .toggle()
    })

    $('#notifications').on('click', 'li', function(){
        clear_url = $(this).attr('clearurl')
        
        $.ajax({
            method: "GET",
            url: clear_url,
            data: {},
            success: function(resp){
                getNotifications()
                new_noti_count = resp['new_noti_count']
                console.log(new_noti_count)
                $('.notification-button').html("" + new_noti_count + " Notifications")
            }
        })

        $(this).remove()
    })


    
    //request for all notifications to server and format
    function getNotifications(){
        $.ajax({
            method: 'GET',
            url: "/get_notifications",
            data:{},
            success: function(resp){
                $('#notifications ul').html(resp)
                console.log(resp)
                }
            })
        }
    
    
    function formatNotiItem(noti_item){
        list_el = $('<li></li>').attr('selfID',noti_item['notified_user_id'] ).attr('notiID',noti_item['id'] )
        $(list_el).addClass('notification list-group-item small bg-dark-green p-0 d-flex')
        output = '<a class="text-disabled d-block col-11 notification-go p-0"'
        output += 'href="/dashboard/new/branch/'+noti_item['new_canvas_id'] +'">\n'
        output += '<div class="col-12 p-1">\n'
        if (noti_item['user_status'] == 'P'){
            output += "Somebody branched from your drawing!\n"
        }else{
            output += "Somebody branched on a node you watch!\n"
        }
        output += '<i class="fas fa-arrow-right"></i>\n'
        output += '</div>\n</a>'
        output += '<div class="notification-close col-1 py-1 text-disabled">\n'
        output += '<i class="fas fa-times"></i>\n'
        output += '</div>\n'
        list_el.append(output)
        return list_el
    }
    $('#mini-logreg').on('click', '.close', function(){
        $('#mini-logreg').hide()
    })
    
    $('.login-button, .register-button').click(function(e){
        console.log("hey")
        $('#mini-logreg').css('top', e.clientY + 10)
        .css('left', e.clientX )
        .empty()
        .toggle()
        if($(this).hasClass('login-button')){
            console.log($('#login').get(0))
            $('#mini-logreg').html($('#login').html())
        } else {
            console.log($('#register').get(0))
            $('#mini-logreg').html($('#register').html())
        }
    })
    
    $(window).scroll(function(){
        $('#notifications').hide()
        $('#mini-logreg').hide()
    })
    getNotifications()
    $('#notifications').hide()
});