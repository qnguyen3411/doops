console.log("DINLEBERRY")
$( document ).ready(function() {

    
    class DrawTool {
        constructor(context, overlayContext=null, colorStr = 'rgb(1, 1, 1)' , size=1){
            this.ctx = context;
            this.ovl_ctx = overlayContext;
            this.ctx.fillStyle = colorStr;
            this.ctx.strokeStyle = colorStr;
            this.ctx.lineWidth = size;
        }
        setColor(colorStr){
            this.ctx.fillStyle = colorStr;
            this.ctx.strokeStyle = colorStr;
        }
        setSize(size){
            this.ctx.lineWidth = size;
        }
        mouseDown(X, Y){
            this.ctx.beginPath();
            this.ctx.arc(X, Y,
                this.ctx.lineWidth/2, 0, 2 * Math.PI, false);
                this.ctx.fill();
                this.ctx.closePath();
            }
        mouseMove(prevX, prevY, currX, currY){
            this.ctx.beginPath();
            this.ctx.moveTo(prevX, prevY);
            this.ctx.lineTo(currX, currY);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    }
    class Ruler extends DrawTool {
        mouseDown(X, Y){
            this.pinX = X;
            this.pinY = Y;
        }
        mouseMove(X,Y){
            this.ctx.drawImage(overlay,0 , 0)
            this.ctx.beginPath()  
            this.ctx.moveTo(this.pinX, this.pinY)
            this.ctx.lineTo(X, Y)
            this.ctx.stroke();
        }
    }
    
    class Eraser extends DrawTool{
        constructor(context, lineWidth=1){
            super(context=context, lineWidth=lineWidth, colorStr = "rgb(255, 255, 255)");
        }
        setColor(){return;}
        
    }
    class ColorTool{
        constructor(affectedTools = [], colorBox){
            this.colorBox = colorBox;
            this.affectedTools = affectedTools;
        }
        updateToolColor(colorStr){
            for(i = 0; i < this.affectedTools.length; i++){
                this.affectedTools[i].setColor(colorStr)
            }
            return this;
        }
        
        updateColorBox(colorStr){
            $(this.colorBox).css('background-color', colorStr);
            return this;
        }
    }
    
    class Eyedropper extends ColorTool{
        
        mouseDown(X,Y){
            imgData = this.ctx.getImageData(X, Y, 1,1);
            update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);
            return imgData
        }
        mouseMove(X,Y){this.mouseDown(X,Y);}
        mouseUp(){return;}
        mouseLeave(){return;}
    }
    
    class ColorSlider extends ColorTool{
        constructor(affectedTools, colorBox, rSlider, gSlider, bSlider, hSlider, sSlider, lSlider){
            super(affectedTools, colorBox)
            this.RGBsliders = [rSlider, gSlider, bSlider]
            this.HSLsliders = [hSlider, sSLider, lSlider]
        }
        
        adjustSliders(mode, valArr){
            if (mode == "rgb"){
                this.RGBsliders[0].setVal(valArr[0])
                this.RGBsliders[1].setVal(valArr[1])
                this.RGBsliders[2].setVal(valArr[2])
                hslArr = hslToRgb(valArr)
                this.HSLsliders[0].setVal(hslArr[0])
                this.HSLsliders[1].setVal(hslArr[1])
                this.HSLsliders[2].setVal(hslArr[2])
            } else {
                rgbArr = rgbToHsl(valArr)
                this.RGBsliders[0].setVal(rgbArr[0])
                this.RGBsliders[1].setVal(rgbArr[1])
                this.RGBsliders[2].setVal(rgbArr[2])
            }
        }
        
    }
    class Slider{
        constructor(label_el, slider_el){
            this.label_el = label_el;
            this.slider_el = slider_el;
        }
        getName(){
            return $(this.label_el).attr('for')
        }
        getVal(){
            return $(this.slider_el).val()
        }
        setVal(val){
            $(this.label_el).html(val)
            $(this.slider_el).val(val)
        }
    }
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
    var color = "black";
    var opacity = 1.0;
    var size = 1;

    var pen_obj = new DrawTool(context = ctx, overlayContext = ovl_ctx, colorStr = color, size = 1)
    var ruler_obj = new Ruler(context = ctx, overlayContext = ovl_ctx, colorStr = color, size = 1)
    var eraser_obj = new Eraser(context = ctx, size = 6)
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
            pinX = currX
            pinY = currY
        }else{
            curr_tool.mouseDown(currX, currY)
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
            // if(curr_tool != "eraser" ){
            //     ctx.strokeStyle = color;
            // }else{
            //     ctx.strokeStyle = "white";
            // }
            ctx.lineCap="round";
            ctx.lineWidth = size;
            if(curr_tool == "eyedropper"){
                imgData = ctx.getImageData(currX, currY, 1,1);
                update_color("rgb",imgData.data[0],imgData.data[1],imgData.data[2]);
            }else if(curr_tool == "ruler"){
                drawLine()
            }else{
               curr_tool.mouseMove(prevX, prevY, currX, currY)
            }
        }
        $('.draw-cursor')
            .css('top', (e.pageY - size/2  ) + "px")
            .css('left', (e.pageX - size/2 ) + "px")
    });
    
    function dot(){
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(currX, currY,
            size/2, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }
    function draw() {
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(currX, currY);
        ctx.stroke();
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
        ovl_ctx.globalAlpha =  opacity;
        ovl_ctx.drawImage(canvas,0 ,0)
        ctx.drawImage(overlay, 0, 0)
        ovl_ctx.globalAlpha = 1;
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
        name = $(this).attr('id')
        if (name == "pen"){
            console.log("PENNNN")
            curr_tool = pen_obj;
        } else if (name == "eraser"){
            console.log("ERASRRR")
            curr_tool = eraser_obj;
        }
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