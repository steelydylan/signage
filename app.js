var app = require('express')();
var util = require('./util');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cheerio = require("cheerio");
var request = require("request");
var items = [];
app.use(require('express').static(__dirname+'/public'));
app.engine('html', require('ejs').renderFile);
server.listen(3000);
app.set('view engine','ejs');
app.get('/', function (req, res) {
  res.render("index.html");
});
app.get('/app',function(req,res){
	res.render("app.html");
});

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });

  //ブログのエントリーリストを取得
  socket.on('entryList',function(msg){
  	request({uri: msg.url+"/iOS/summary.json"}, function(error, response, body){
  		socket.emit("entryList",body);
  	});
  });

  //サイネージに流すエントリーを登録
  socket.on('setEntries',function(msg){
  	items = [];
  	msg.entries.forEach(function(item){
  		request({uri: item.url+"/bid/"+item.bid+"/eid/"+item.eid},function(error,response,body){
  			var html = util.getEntryHtml(msg,body);
  			items.push({eid:item.eid,html:html});
  		});
  	})
  });

  //サイネージに流すエントリーを送信
  socket.on('getEntries',function(msg){
  	socket.emit('getEntries',items);
  });

  //割り込みようのサイネージを取得し送信
  socket.on('streamUrgentEntry', function (msg) {
  	request({uri: msg.url+"/bid/"+msg.bid+"/eid/"+msg.eid}, function(error, response, body) {
  		var data = util.getEntryHtml(msg,body);
    	socket.broadcast.emit("streamUrgentEntry",data);
    });
  });
});