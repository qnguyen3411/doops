
$( document ).ready(function() {


    $('#dashboard_window').on('click','.watch-button',function(){
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

    $('#dashboard_window').on('mouseenter','.preview_link',function(e){
        $('#preview-box img').attr(
            'src',
            $(this).attr('imgpreview')
        )
        $('#preview-box').show()
        $('#preview-box').css('top', e.pageY - 110 ).css('left', e.pageX + 5)
    })
    .on('mouseleave', '.preview_link', function(e){
        $('#preview-box').hide()

    })
    $('#dashboard_window').on('change', '.relations-settings',function(){
        relatives_list = $(this).children('.relatives-list').get(0)
        $.ajax({
            url: $(this).attr('action'),
            method: 'GET',
            data: $(this).serialize(),
            success: function(resp){
                $(relatives_list).html(resp)

            }
        })
    })

    $('#dashboard_window').on('submit', '.relations-settings',function(){
        $(this).children('input[name="make_thread"]').val(true)
        $(this).attr(
            'action',
            $(this).attr('threadurl')
        )
        $(this).submit()
    })

    $('#dashboard_window').on('click', '.relative-option',function(){
        $(this).parent().children().removeClass('selected')
        $(this).addClass('selected')
        $(this).parent().children('input').val(
            $(this).attr('value')
        )
        $(this).parent().trigger('change')
    })

    $('.link-user').click(function(){
        var mode;
        $('#browse-settings').attr(
            'action',
            $(this).attr('href')
        )
        if($(this).hasClass('link-user-post')){
            mode = 'post'
        } else {
            mode = 'watch'
        }
        $('#browse-settings input[name=mode]').attr('value', mode)
        $('#browse-settings').submit()
        return false;
    })

    


    $('#preview-box').hide()
    
});