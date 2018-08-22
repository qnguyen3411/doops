console.log("HELLO ORLD")

$( document ).ready(function() {

    // function handler1() {
    //     console.log("HEY")
    //     $('#nav-menu a').css('width', 70);
    //     $(this).one("click", handler2);
    // }
    // function handler2() {
    //     console.log("HO")
    //     $('#nav-menu a').css('width', 0);
    //     $(this).one("click", handler1);
    // }
    // $("i").one("click", handler1);

    

    $(".browse-settings, .sort-settings").click(function(){

        
        if ($(this).hasClass("browse-settings")){
            if ($(this).hasClass("all")){
                $('#browse-settings .mode').val('all')
            }else if ($(this).hasClass("node")){
                console.log("nodeeee")
                $('#browse-settings .node_id').val($(this).parent().attr('nodeID'))
                $('#browse-settings .mode').val('node')
            }else{
                $('#browse-settings .user_id').val($(this).parent().attr('userID'))
                if ($(this).hasClass("post")){
                    $('#browse-settings .mode').val('post')
                }else{
                    $('#browse-settings .mode').val('watch')
                }
            }
        }else{ //if class sort-settings
            if ($(this).hasClass("new")){
                $('#browse-settings .sort').val('new')
            }else{
                $('#browse-settings .sort').val('popular')
            }
        }
        $.ajax({
            method : "POST",
            url: "/get_nodes",
            
            data: $('#browse-settings').serialize(),
            success: function(resp){
                // for(var i=0; i<resp.length; i++){
                //     console.log(resp[i])
                // }
                console.log(resp['canvas_list'][1])
                output = "";
                // for(var i = 0; i < resp['canvas_list'].length; i++){
                //     output += '<li class="list-group-item p-0 mx-1 mt-2 bg-neutral border-0">\n'
                //     output += '<h6 class="card-header font-weight-bold bg-neutral d-block mx-1 pb-0">\n'
                //     output += '<div class="row">\n'
                //     output += '<p class="col-7">\n'
                //     output += '<a class="browse-settings text-disabled" href="">'+resp['canvas_list'][i]['']+'{{canvas.poster.username}}</a>'
                    
                // }
            }
        })

    //     $(".browse-settings").click(function(){
    //     //all browse settings: 
    //     //all , new, popular,( post, watch)(need user id), node(need node id), prev(need previous form)

    //     if ($(this).hasClass("all")){
    //         $('#browse-settings .mode').val('all')
    //         $('#head-description').html('Browsing all nodes')
    //     }else{
    //         nodeID = $(this).parent().attr('nodeID')
    //         posterID = $(this).parentsUntil('ul','li').attr('posterID')
    //         $('#browse-settings .node_id').val(nodeID)
    //         $('#browse-settings .user_id').val(userID)
    //         if ($(this).hasClass("post")){
    //             $('#browse-settings .mode').val('post')
    //         }else{
    //             $('#browse-settings .mode').val('watch')
    //         }
    //     }
        
    //     $.ajax({
    //         method : "POST",
    //         url: "/get_nodes",
            
    //         data: $('#browse-settings').serialize(),
    //         success: function(resp){
    //             console.log(resp)
    //         }
    //     })
    // })
    // $('#searchbox').hide()

    })
});