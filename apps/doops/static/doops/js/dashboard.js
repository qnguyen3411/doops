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
        $('#preview-box')
            .css(
                'top', e.pageY - $('#preview-box').height() * 1.15 
            )
            .css(
                'left', e.pageX + 5
            )
    })
    .on('mouseleave', '.preview_link', function(e){
        $('#preview-box').hide()
    }) //end

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

    $('.mode-setter, .sort-setter').click(function(){
        $('#browse-settings').attr(
            'action',
            $(this).attr('href')
        )
        if($(this).hasClass('mode-setter')){
            input = $('#browse-settings input[name=mode]').get(0)
        } else {
            input = $('#browse-settings input[name=sort]').get(0)
        }
        $(input).attr(
            'value', 
            $(this).attr('value')
        )
        $('#browse-settings').submit()
        return false;
    })

    var numCols = Math.floor(
        $('#dashboard_window').width() 
        / $('#dashboard_window li').outerWidth(includeMargin=true)
        )
        
    
    $(window).resize(function() {
        var newNumCols = Math.floor(
            $('#dashboard_window').width() 
            / $('#dashboard_window li').outerWidth(includeMargin=true)
            );
        if (newNumCols != numCols){
            numCols = newNumCols;
            loadDashboardColumns(numCols)
        }
    })

    function loadDashboardColumns(numCols){
        var liArr = $('#dashboard_window').find('li')

        // Remove all old column divs
        $($('.dashboard-column').children()).unwrap()
        $('.dashboard-column').remove()

        // Generate new column divs
        for( var i = 0; i < numCols; i++){
            $('#dashboard_window').append('<div class="dashboard-column"></div>')
        }
        $('.dashboard-column').width(
            $('#dashboard_window li').outerWidth(includeMargin=true) - 10
        )
        var colArr = $('#dashboard_window').children('.dashboard-column')

        // Load li's into columns
        for( var i = 0 ; i < liArr.length; i++){
            pos = i % numCols
            $(colArr[pos]).append(liArr[i])
        }
    }


    $('#preview-box').hide()
    loadDashboardColumns(numCols)
});