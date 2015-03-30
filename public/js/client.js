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
var socket = io.connect(config.socketServer);
var signage = JSON.parse(localStorage.getItem("signage"));
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
    localStorage.setItem("signage",JSON.stringify(items));//取得したデータをローカルストレージに保存
});
var loop = function(){
    if(i === 0){
        if(temps.length > 0){
            entries = temps.slice(0);
        }else{
            entries = signage;
        }
        socket.emit("getEntries");
    }
    var item = entries[i];
    var target = "#drawArea" + (i % 2);
    var target2 = "#drawArea" + ((i + 1) % 2);
    if(entry.display){//緊急のエントリーがある場合
        $(target)
        .queue(function(next){
            if($(target).hasClass("right")){
                $(target2).addClass("left");
                $(target).removeClass("right");
                $(target).html(entry.html);
            }else{
                $(target).addClass("left");
                $(target2).removeClass("right");
                $(target2).html(entry.html);
            }
            i = (i + 1) % entries.length;   
            next();
        })
        .delay(5000)
        .queue(function(next){
            if($(target).hasClass("left")){
                $(target).removeClass('left');
                $(target).addClass("right");
            }else{
                $(target2).removeClass('left');
                $(target2).addClass("right");
            }
            next();
        })
        .delay(1000)
        .queue(function(next){
            entry.display = false;
            loop();
            next();
        });
    }else if(item){//エントリーが登録されていたら
        $(target)
        .queue(function(next){
            if($(target).hasClass("right")){
                $(target2).addClass("left");
                $(target).removeClass("right");
                $(target).html(item.html);
            }else{
                $(target).addClass("left");
                $(target2).removeClass("right");
                $(target2).html(item.html);
            }
            i = (i + 1) % entries.length;   
            next();
        })
        .delay(1000)
        .queue(function(next){
            if($(target).hasClass("left")){
                $(target).removeClass('left');
                $(target).addClass("right");
            }else{
                $(target2).removeClass('left');
                $(target2).addClass("right");
            }
            next();
        })
        .delay(100+item.time)
        .queue(function(next){
            loop();
            next();
        });
    }else{//それ以外なら
        $(target)
        .delay(1000)
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