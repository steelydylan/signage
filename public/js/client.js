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
var socket = io.connect(socketServer);
var entries = [];
var temps = [];
var i = 0;
//割り込み表示用
var entry = {time:0,html:""};
//登録されたエントリーを取得
socket.emit("getEntries");
socket.on("getEntries",function(items){
    temps = items.slice(0);
});
setInterval(function(){
    if(i === 0){
        entries = temps.slice(0);
        socket.emit("getEntries");
    }
    $(".cover")
    .delayAddClass("state1",500)
    .delayRemoveClass("state1",500)
    .queue(function(next){
        if(entry.time == 0){
            $("#drawArea").html(entries[i].html);
            i = (i + 1) % entries.length;
        }else{
            $("#drawArea").html(entry.html);
            entry.time = 0;
        }
        next();
    });
},10000);
//緊急のエントリーを表示
socket.on('streamUrgentEntry', function (data) {
    entry.time = 1;
    entry.html = data;
});
})(jQuery);