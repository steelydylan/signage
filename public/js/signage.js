  var socket = io.connect(socketServer);
  var entryList = new Moon.View({id:"entryList",data:{entry:[]}});
  var entries = [];
  socket.on('connect',function(){
    socket.emit('entryList',{url:url});
    socket.on('entryList',function(json){
        json = JSON.parse(json);
        entryList.data.entry = json.entry_summary;
        entryList.update();
        socket.emit('getEntries');
        socket.on('getEntries',function(data){
            data.forEach(function(data){
                $("input[data-eid='"+data.eid+"']").prop("checked",true);
                entries.push({bid:data.bid,eid:data.eid});
            })
        });
    });
  });
  //サイネージの登録
  $(document).on("change",".js-checkbox",function(){
    var bid = $(this).data("bid");
    var eid = $(this).data("eid");
    if($(this).prop("checked")){
        entries.push({bid:bid,eid:eid});
    }else{
        entries = entries.filter(function(item){
            return item.eid != eid;
        });
    }
    console.log(entries);
    socket.emit("setEntries",{area:area,url:url,fixPath:true,entries:entries});
  });
  //サイネージの割り込み送信
  $(document).on("click",".js-display",function(){
    var bid = $(this).data("bid");
    var eid = $(this).data("eid");
    socket.emit("streamUrgentEntry",{bid:bid,eid:eid,area:area,url:url,fixPath:true});
  });