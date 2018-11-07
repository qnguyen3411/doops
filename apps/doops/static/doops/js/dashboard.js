$( document ).ready(function() {
    var modal = $('#preview-modal').get(0)
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

                $(''+watch_selector).html(resp['target_watch'].toString()+ " watches")
                $('#self-numwatch').html(resp['user_watch'].toString() + " Watches")

                for(var i = 0; i < resp['change_list'].length; i++){
                    total_watch_selector = '#canvas-'+ resp['change_list'][i]['id'] + " .total-watches"
                    $(''+total_watch_selector).html(
                        "("+
                        resp['change_list'][i]['total_watch_num'].toString()
                        +" total)")
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
    })
    .on('click', '.preview_link, .main-img', function(){
        $(modal).show()
        var modal_img = $('.modal-content img').get(0)
        var modal_view_link = $('.modal-content .view-link').get(0)
        var modal_draw_link = $('.modal-content .draw-link').get(0)
        $(modal_img).attr(
            'src',
            $(this).attr('imgpreview')
        )
        $(modal_view_link).attr(
            'href',
            $(this).attr('viewlink')
        )
        $(modal_draw_link).attr(
            'href',
            $(this).attr('drawlink')
        )
        return false;
    })
     //end
    $('.modal-content').hover(
    function(){
        $('.img-links').show()
    }, function(){
        $('.img-links').hide()

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
    

    $('#dashboard_window').on('click', '.report-button',function(){
        $.ajax({
            url: $(this).attr('href'),
            method: 'GET',
            data: {},
            success: function(resp){
                console.log(resp)
            }
        })
        return false;
    })


    window.onclick = function(e) {
        if (e.target == modal) {
            $(modal).hide();
        }
    }


    $('#preview-box').hide()
    loadDashboardColumns(numCols)
});