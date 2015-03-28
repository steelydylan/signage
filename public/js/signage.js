(function($){
    $.fn.delayAddClass = function(className,delay){
        return $(this).delay(delay).queue(function(next){
            $(this).addClass(className);
            next();
        });
    };
    $.fn.delayRemoveClass = function(className,delay){
        return $(this).delay(delay).queue(function(next){
            $(this).removeClass(className);
            next();
        });
    }
})(jQuery);

(function($){
var socket = io.connect('http://localhost:3000');
socket.on('streamUrgentEntry', function (data) {
    $(".cover")
    .delayAddClass("state1",500)
    .delayRemoveClass("state1",500)
    .queue(function(next){
        console.log("test");
        $("#drawArea").html(data);
        next();
    });
});
})(jQuery);