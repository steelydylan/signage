var app = require('express')();
var util = require('./util');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
mongoose.connect(process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "mongodb://localhost:27017/signage");
mongoose.model('entry',new Schema({
  html:String,
  bid:Number,
  eid:Number
}));
var entries = mongoose.model('entry');
app.use(require('express').static(__dirname+'/public'));
app.engine('html', require('ejs').renderFile);
server.listen(process.env.PORT || 3000);
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
    entries.remove({},function(){
    	msg.entries.forEach(function(item){
    		request({uri: msg.url+"/bid/"+item.bid+"/eid/"+item.eid},function(error,response,body){
          var entry = new entries();
    			entry.html = util.getEntryHtml(msg,body);
          entry.bid = item.bid;
          entry.eid = item.eid;
    			entry.save();
    		});
    	});
    });
  });

  //サイネージに流すエントリーを送信
  socket.on('getEntries',function(msg){
    entries.find({},function(err,items){
  	 socket.emit('getEntries',items);
    });
  });

  //割り込みようのサイネージを取得し送信
  socket.on('streamUrgentEntry', function (msg) {
  	request({uri: msg.url+"/bid/"+msg.bid+"/eid/"+msg.eid}, function(error, response, body) {
  		var data = util.getEntryHtml(msg,body);
    	socket.broadcast.emit("streamUrgentEntry",data);
    });
  });
});