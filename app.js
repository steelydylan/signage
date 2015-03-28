var app = require('express')();
var util = require('./util.js');
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

  socket.on('entryList',function(msg){
  	request({uri: msg.url+"/iOS/summary.json"}, function(error, response, body){
  		socket.emit("entryList",body);
  	});
  });

  socket.on('setEntries',function(msg){
  	msg.entries.forEach(function(item){
  		request({uri: item.url+"/bid/"+item.bid+"/eid/"+item.eid},function(error,response,body){
  			var $ = cheerio.load(body);
  			if(msg.fixPath){
  				var host = "http://"+util.getLocation(msg.url).hostname;
  				//$("")
  			}
  		});
  	})
  });

  socket.on('signage1', function (msg) {
  	request({uri: msg.url+"/bid/"+msg.bid+"/eid/"+msg.eid}, function(error, response, body) {
  		var $ = cheerio.load(body);
  		if(msg.fixPath){
  			var host = "http://"+util.getLocation(msg.url).hostname;
  			$("img").each(function(){
  				var src = $(this).attr("src");
  				if(!src.match(/http/)){
  					$(this).attr("src",host+src);
  				}
  			});
  		}
  		var data = $(msg.area).html();
    	socket.broadcast.emit("signage1",data);
    });
  });
});