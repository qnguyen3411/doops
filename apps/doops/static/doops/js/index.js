console.log("HELLO ORLD")

$( document ).ready(function() {
    // Tab functionalities;
    $('.nav-link').click(function(){
        $('.nav-link, .tab-pane').removeClass("active active-grey");
        $('.nav-link').addClass("text-neutral bg-disabled")

        $(this).addClass("active-grey");
        $(this).removeClass("text-neutral bg-disabled");

        $(this.getAttribute("href")).addClass("active active-grey");
    }); //end nav-link click function

    function displaySiblingRow(){
        curr = document.getElementsByClassName('curr-sibling')[0];
        $('.display-node').attr('src', $(curr).attr('src'));
        $(curr).show();
        //if next exist
        if($(curr).next().hasClass('sibling')){
            $(curr).next().show();
            // if prev doesnt exist and next next exist
            if (!$(curr).prev().hasClass('sibling') && $(curr).next().next().hasClass('sibling')){
                $(curr).next().next().show();
            }
        }
        //if prev exist
        if($(curr).prev().hasClass('sibling')){
            $(curr).prev().show();
            //if next doesnt exist and prev prev exist
            if (!$(curr).next().hasClass('sibling') && $(curr).prev().prev().hasClass('sibling')){
                $(curr).prev().prev().show();
            }
        }
    }

    document.onkeydown = function(e){
        $('.sibling').hide();
        //TRAVERSAL
        //if prev exists
        if(e.keyCode == 37 && $(curr).prev().hasClass('sibling')){
                $(curr).removeClass('curr-sibling');
                $(curr).prev().addClass('curr-sibling');
        };
        //if next exists
        if(e.keyCode == 39 && $(curr).next().hasClass('sibling')){ 
                $(curr).removeClass('curr-sibling');
                $(curr).next().addClass('curr-sibling');
        };
        displaySiblingRow();
    };

    // On document start 
    $('.sibling').hide();
    curr = document.getElementsByClassName('curr-sibling')[0]
    displaySiblingRow()

});