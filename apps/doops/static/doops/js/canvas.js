
$( document ).ready(function() {
    // Tab functionalities;
    function handler1() {
        $('#nav-menu a').css('width', 70);
        $(this).one("click", handler2);
    }
    function handler2() {
        $('#nav-menu a').css('width', 0);
        $(this).one("click", handler1);
    }
    $("#menu-icon").one("click", handler1);

    var canvas = document.getElementById('botCanvas');
    var ctx = canvas.getContext("2d");
    var canv_offset = getOffset(canvas);
    var prevX = 0;
    var currX = 0;
    var prevY = 0;
    var currY = 0;
    var flag = false;
    var dot_flag = false;
    var overlay = document.getElementById('topCanvas');
    var ovl_ctx = overlay.getContext("2d")
    var start_img = document.getElementById('start_img')
    ctx.drawImage(start_img, 0, 0, canvas.width, canvas.height)
    ovl_ctx.drawImage(start_img, 0, 0, canvas.width, canvas.height)

    var pallete = document.getElementById('pallete');
    var pal_ctx = pallete.getContext("2d");
    var pal_img = document.getElementById('pallete_img')
    var pal_offset = getOffset(pallete);
    pal_ctx.drawImage(pal_img, 0, 0, pallete.width, pallete.height)
    
    var curr_tool = "pen";
    var color = "black";
    var opacity = 1.0;
    var size = 1;
    //Canvas functionality
    $( '.canvas-container' )
        .mousedown(function(e) {
            prevX = currX;
            prevY = currY;
            currX = e.clientX + $(window).scrollLeft() - canv_offset.left;
            currY = e.clientY + $(window).scrollTop() - canv_offset.top ;
            flag = true
            dot_flag = true;
            if (dot_flag) {
                if(curr_tool == "eyedropper"){
                    imgData = ctx.getImageData(currX, currY, 1,1);
                    update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);    
                }else{
                    if(curr_tool == "pen" ){
                        ctx.fillStyle = color;
                    }else{
                        ctx.fillStyle = "white";
                    }
                    ctx.beginPath();
                    ctx.arc(e.clientX + $(window).scrollLeft() - canv_offset.left,
                    e.clientY + $(window).scrollTop() - canv_offset.top,
                    size/2, 0, 2 * Math.PI, false);
                    ctx.fill()
                    ctx.closePath();
                    dot_flag = false;
                }
            }
        })
        .mouseup(function(e) {
            flag = false;
            merge();
        })
        .mouseleave(function(e){
            flag = false;
            $('.draw-cursor').hide()
            merge();
        })
        .mousemove(function(e){
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.clientX + $(window).scrollLeft() - canv_offset.left;
                currY = e.clientY + $(window).scrollTop() - canv_offset.top;
                if(curr_tool == "eyedropper"){
                    imgData = ctx.getImageData(currX, currY, 1,1);
                    update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);    
                }else{
                    draw();
                }
            }
            $('.draw-cursor').show()
                .css('top', (e.clientY - size/2 + $(window).scrollTop() ) + "px")
                .css('left', (e.clientX - size/2 + $(window).scrollLeft() ) + "px")
        });
    function draw() {
        if(curr_tool == "pen" ){
            ctx.strokeStyle = color;
        }else{
            ctx.strokeStyle = "white";
        }
        ctx.lineCap="round";
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
        ctx.closePath();
    }
    function merge(){
        ctx.globalAlpha = 1.0 - opacity;
        ctx.drawImage(overlay, 0, 0)
        ovl_ctx.drawImage(canvas,0 ,0)
        ctx.globalAlpha = 1;
    }

    //Pallete functionality
    $( "#pallete" )
        .mousedown(function(e) {
            X = e.clientX + $(window).scrollLeft() - pal_offset.left;
            Y = e.clientY + $(window).scrollTop() - pal_offset.top ;
            flag = true
            imgData = pal_ctx.getImageData(X, Y, 1,1);
            update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2])
        })
        .mouseup(function(e) {
           flag = false;
        })
        .mouseleave(function(e){
            flag = false;
        })
        .mousemove(function(e){
            if (flag) {
                X = e.clientX + $(window).scrollLeft() - pal_offset.left;
                Y = e.clientY + $(window).scrollTop() - pal_offset.top ;
                imgData = pal_ctx.getImageData(X, Y, 1,1);
                update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);
            }
        });

    //slider functionality
    $('#opa-slider').on("input change",function(){
        val = this.value
        $('#opa-value').html(val)
        opacity = val / 100
        $('#topCanvas').css('opacity', 1.0 - opacity)
    })
    
    $('#size-slider').on("input change",function(){
        val = this.value
        $('#size-value').html(val)
        size = val
        $('.draw-cursor').css('width', size)
        .css('height', size)
    })

    
    $('#rgb input , #hsl input').on("input change",function(){
        if($(this).hasClass('rgb')){
            update_color("rgb",
                $('#red').val(),
                $('#green').val(),
                $('#blue').val())
        }else{
            update_color("hsl",
                $('#hue').val(),
                $('#saturation').val(),
                $('#lightness').val())
        }
    })
    
    $('.tool-settings').click(function(){
        var link = $(this).attr('link')
        $(this).parent().children().removeClass('selected text-lightgreen'). addClass('text-disabled')
        $(this).addClass('selected text-lightgreen').removeClass('text-disabled')
        $('#color-tool').children().hide()
        $(link).fadeIn()
    })

    //canvas tool functionalities
    $('.tool.pen').click(function(){
        curr_tool = "pen"
        $(this).parent().children().removeClass('selected')
        $(this).addClass('selected')
    })
    $('.tool.eraser').click(function(){
        curr_tool = "eraser"
        $(this).parent().children().removeClass('selected')
        $(this).addClass('selected')
    })

    $('.tool.eyedropper').click(function(){
        curr_tool = "eyedropper"
        $(this).parent().children().removeClass('selected')
        $(this).addClass('selected')
    })

    $('.tool.clear').click(function(){
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ovl_ctx.fillStyle = "white";
        ovl_ctx.fillRect(0, 0, canvas.width, canvas.height);
    })

    //helper functions
    function getOffset( el ) {
        var _x = 0;
        var _y = 0;
        while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
            _x += el.offsetLeft - el.scrollLeft;
            _y += el.offsetTop - el.scrollTop;
            el = el.offsetParent;
        }
        return { top: _y, left: _x };
    }

    function update_color(mode, val1, val2, val3){
        if(mode == "rgb"){
            //update color
            color = "" + mode + "(" + val1 + "," + val2 + "," + val3 + ")"
            //update sliders
            var rgbBox = document.getElementById('rgb');
            updateSliders(rgbBox, [val1, val2, val3]);
            var hslBox = document.getElementById('hsl');
            updateSliders(hslBox, rgbToHsl(val1, val2, val3));
        }else{
            //update color
            color = "" + mode + "(" + val1 + "," + val2 + "%," + val3 + "%)"
            //update sliders
            var rgbBox = document.getElementById('rgb');
            updateSliders(rgbBox, hslToRgb(val1, val2, val3));
        }
        $('#curr-color').css('background-color', color);
    }
    function updateSliders(container, values){
        for(var i = 0; i < 3; i++){
            $($(container).children('span')[i]).html(values[i])
            $($(container).children('input')[i]).val(values[i])
        }
    }

    function hslToRgb(h, s, l){
        h /= 360, s /= 100, l /= 100;
        var r, g, b;
    
        if(s == 0){
            r = g = b = l; // achromatic
        }else{
            var hue2rgb = function hue2rgb(p, q, t){
                if(t < 0) t += 1;
                if(t > 1) t -= 1;
                if(t < 1/6) return p + (q - p) * 6 * t;
                if(t < 1/2) return q;
                if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            }
    
            var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            var p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
    
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
    function rgbToHsl(r, g, b){
        r /= 255, g /= 255, b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b);
        var h, s, l = (max + min) / 2;
    
        if(max == min){
            h = s = 0; // achromatic
        }else{
            var d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }


    $('#submit-button').click(function(){
        url = canvas.toDataURL();
        $('#submit').append('<input type="hidden" name="data_url" value="'+url+'">');
        $('#submit').submit();
    })
    //initialize page
    $('#sliders').hide()
    $('#curr-color').css('background-color', color)
});