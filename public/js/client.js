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
var started = false;
//割り込み表示用
var entry = {display:false,html:""};
//登録されたエントリーを取得
socket.emit("getEntries");
socket.on("getEntries",function(items){
    temps = items.slice(0);
});
var loop = function(){
    if(i === 0){
        entries = temps.slice(0);
        socket.emit("getEntries");
    }
    var item = entries[i];
    if(entry.display){//緊急のエントリーがある場合
        $(".cover")
        .delayAddClass("state1",500)
        .delayRemoveClass("state1",500)
        .queue(function(next){
            $("#drawArea").html(entry.html);
            entry.display = false;
            next();
        })
        .delay(5000)
        .queue(function(next){
            loop();
            next();
        });
    }else if(item){//エントリーが登録されていたら
        $(".cover")
        .delayAddClass("state1",500)
        .delayRemoveClass("state1",500)
        .queue(function(next){
            $("#drawArea").html(item.html);
            i = (i + 1) % entries.length;   
            next();
        })
        .delay(item.time)
        .queue(function(next){
            loop();
            next();
        });
    }else{//それ以外なら
        $(".cover")
        .delayAddClass("state1",500)
        .delayRemoveClass("state1",500)
        .delay(5000)
        .queue(function(next){
            loop();
            next();
        });
    }
};
loop();
//緊急のエントリーを表示
socket.on('streamUrgentEntry', function (data) {
    entry.display = true;
    entry.html = data;
});
})(jQuery);