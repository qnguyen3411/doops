
$( document ).ready(function() {

    var canvas = $('#botCanvas').get(0);
    var ctx = canvas.getContext("2d");
    var canv_offset = $(canvas).offset();
    var prevX = 0;
    var currX = 0;
    var prevY = 0;
    var currY = 0;
    var pinX = 0;
    var pinY = 0;
    var flag = false;
    var overlay = $('#topCanvas').get(0);
    var ovl_ctx = overlay.getContext("2d");
    var start_img = $('#start_img').get(0);
    ctx.drawImage(start_img, 0, 0, canvas.width, canvas.height)
    ovl_ctx.drawImage(start_img, 0, 0, canvas.width, canvas.height)

    var pallete = $('#pallete').get(0);
    var pal_ctx = pallete.getContext("2d");
    var pal_img = $('#pallete_img').get(0)
    var pal_offset = $(pallete).offset();
    pal_ctx.drawImage(pal_img, 0, 0, pallete.width, pallete.height)
    
    var curr_tool = "pen";
    color = "black";
    var opacity = 1.0;
    var size = 1;
    

    //Canvas functionality
    $( '.canvas-container' )
        .mouseenter(function(){
            $('.draw-cursor').show()
        })
        .mousedown(function(e) {
            prevX = currX;
            prevY = currY;
            currX = e.pageX - canv_offset.left;
            currY = e.pageY - canv_offset.top;
            flag = true;
            
            if(curr_tool == "eyedropper"){
                imgData = ctx.getImageData(currX, currY, 1,1);
                update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);    
            }else if(curr_tool == "ruler"){
                pinX =currX
                pinY = currY
                console.log("mousedown")
            }else{
                draw(dot=true)
            }
        })
        .mouseup(function(e) {
            flag = false;
            ctx.closePath()
            merge();
        })
        .mouseleave(function(e){
            flag = false;
            ctx.closePath()
            $('.draw-cursor').hide();
            merge();
        })
        .mousemove(function(e){
            if (flag) {
                prevX = currX;
                prevY = currY;
                currX = e.pageX - canv_offset.left;
                currY = e.pageY - canv_offset.top;
                if(curr_tool != "eraser" ){
                    ctx.strokeStyle = color;
                }else{
                    ctx.strokeStyle = "white";
                }
                ctx.lineCap="round";
                ctx.lineWidth = size;
                if(curr_tool == "eyedropper"){
                    imgData = ctx.getImageData(currX, currY, 1,1);
                    update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);
                }else if(curr_tool == "ruler"){
                    drawLine()
                }else{
                    draw();
                }
            }
            $('.draw-cursor')
                .css('top', (e.pageY - size/2  ) + "px")
                .css('left', (e.pageX - size/2 ) + "px")
        });
        
    function draw(dot=false) {
        ctx.beginPath();
        if (dot){
            ctx.fillStyle = color
            ctx.arc(currX, currY,
                size/2, 0, 2 * Math.PI, false);
            ctx.fill()
        }else{
            ctx.moveTo(prevX, prevY);
            ctx.lineTo(currX, currY);
            ctx.stroke();
        }
        ctx.closePath();
    }
    function drawLine(){
        ctx.drawImage(overlay,0 , 0)
        ctx.beginPath()  
        ctx.moveTo(pinX, pinY)
        ctx.lineTo(currX, currY)
        ctx.stroke();
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
            X = e.pageX - pal_offset.left;
            Y = e.pageY - pal_offset.top ;
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
                X = e.pageX - pal_offset.left;
                Y = e.pageY - pal_offset.top ;
                imgData = pal_ctx.getImageData(X, Y, 1,1);
                update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);
            }
        });

    //slider functionality
    $('#opa-slider').on("input change",function(){
        var val = this.value
        $('#opa-value').html(val)
        opacity = val / 100
        $('#topCanvas').css('opacity', 1.0 - opacity)
    })
    $('#size-slider').on("input change",function(){
        var val = this.value
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
    $('.tool:not(.clear)').click(function(){
        curr_tool = $(this).attr('id')
        console.log(curr_tool)
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
    function update_color(mode, val1, val2, val3){
        if(mode == "rgb"){
            //update color
            color = "" + mode + "(" + val1 + "," + val2 + "," + val3 + ")"
            //update sliders
            var rgbBox = $('#rgb').get(0);
            updateSliders(rgbBox, [val1, val2, val3]);
            var hslBox = $('#hsl').get(0);
            updateSliders(hslBox, rgbToHsl(val1, val2, val3));
        }else{
            //update color
            color = "" + mode + "(" + val1 + "," + val2 + "%," + val3 + "%)"
            //update sliders
            var rgbBox = $('#rgb').get(0);
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
    canv_pos = $(canvas).position()
    $(overlay).css('top', canv_pos.top).css('left', canv_pos.left)
    $('#curr-color').css('background-color', color)
});