$(document).ready(function() { 
    $(this).on('keyup', 'input.canvas-settings', function(event){ 
        $("canvas").css($(this).data('prop'), this.value);
    });
});