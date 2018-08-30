console.log("HELLO ORLD")

$( document ).ready(function() {
    // Tab functionalities;
    $('.link').click(function(){
        $('.link, .pane').removeClass("text-lightgreen");
        $('.link').addClass("text-neutral")

        $(this).addClass("text-lightgreen");
        $(this).removeClass("text-neutral");

        $('.pane').addClass('d-none');
        $(this.getAttribute("href")).removeClass('d-none');
    }); //end nav-link click function

});