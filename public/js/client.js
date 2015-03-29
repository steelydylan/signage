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
var entries = [];
var i = 0;
//割り込み表示用
var entry = {time:0,html:""};
//登録されたエントリーを取得
socket.emit("getEntries");
socket.on("getEntries",function(items){
    if(entries.length == 0){//初回のロード時
        if(items[0] && items[0].html){
            $("#drawArea").html(items[0].html);
        }
    }
    entries = items;
});
setInterval(function(){
    i = (i + 1) % entries.length;
    $(".cover")
    .delayAddClass("state1",500)
    .delayRemoveClass("state1",500)
    .queue(function(next){
        if(entries[i]){
            if(entry.time == 0){
                $("#drawArea").html(entries[i].html);
            }else{
                $("#drawArea").html(entry.html);
                entry.time = 0;
            }
        }
        next();
    });
    socket.emit("getEntries");
},10000);
//緊急のエントリーを表示
socket.on('streamUrgentEntry', function (data) {
    entry.time = 1;
    entry.html = data;
});
})(jQuery);