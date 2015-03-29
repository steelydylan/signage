  var socket = io.connect(socketServer);
  var entryList = new Moon.View({id:"entryList",data:{entry:[]}});
  //var entries = [];
  socket.on('connect',function(){
    socket.emit('entryList',{url:url});
    socket.on('entryList',function(json){
        json = JSON.parse(json);
        entryList.data.entry = json.entry_summary;
        entryList.update();
        socket.emit('getEntries');
        socket.on('getEntries',function(data){
            data.forEach(function(data){
                $(".js-checkbox[data-eid='"+data.eid+"']").prop("checked",true);
                $(".js-time[data-eid='"+data.eid+"']").val(data.time || 5000);
                $(".js-sort[data-eid='"+data.eid+"']").val(data.sort || 1);
            })
        });
    });
  });
  //サイネージの登録
  $(document).on("click","#js-setting",function(){
    var entries = [];
    $(".js-checkbox:checked").each(function(){
      var bid = $(this).data("bid");
      var eid = $(this).data("eid");
      var time = $(".js-time[data-eid='"+eid+"']").val();
      var sort = $(".js-sort[data-eid='"+eid+"']").val();
      entries.push({bid:bid,eid:eid,time:time,sort:sort});
    });
    socket.emit("setEntries",{area:area,url:url,fixPath:true,entries:entries});
  });
  //サイネージの割り込み送信
  $(document).on("click",".js-display",function(){
    var bid = $(this).data("bid");
    var eid = $(this).data("eid");
    socket.emit("streamUrgentEntry",{bid:bid,eid:eid,area:area,url:url,fixPath:true});
  });