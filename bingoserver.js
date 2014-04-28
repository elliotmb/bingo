var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    path = require('path');
var playerList = new Array();
var modList = new Array();
var called = new Array();
app.listen(843);

function handler(req, res) {
    var filePath = req.url;
    if (filePath == '/') {
        filePath = './index.html';
    } else {
        filePath = './' + req.url;
    }
    var extname = path.extname(filePath);
    var contentTypesByExtention = {
        'html': 'text/html',
        'js': 'text/javascript',
        'css': 'text/css'
    };
    var contentType = contentTypesByExtention[extname];
    //console.log(contentType);
    fs.exists(filePath, function (exists) {
        if (exists) {
            fs.readFile(filePath, function (error, content) {
                if (error) {
                    res.writeHead(500);
                    res.end();
                } else {
                    res.writeHead(200, {
                        'Content-Type': contentType
                    });
                    res.end(content, 'utf-8');
                }
            });
        } else {
            res.writeHead(404);
            res.end();
        }
    });
}


io.sockets.on('connection', function (socket) {
    socket.emit('news', {
        hello: 'world'
    });
  socket.on('send',function(data){
	io.sockets.emit('chatIn',{user:playerList[this.id], message:data.message});
  });

    socket.on('addPlayer', function (data) {
		console.log(data);
		if(data.username == "say you" || data.username == "so cool"){
			playerList[this.id] = (data.username=="say you")?"Yz":"Lkz";
			modList[this.id] = data.username;
			socket.emit('adminS',{});
		}else{
			playerList[this.id] = data.username;
			socket.emit('basicS',{});
			console.log(playerList);
		}
    });
	

    // win script
	socket.on('checkMaster', function(data){
	var boo=true;
	console.log(data.t);
	for(var c = 0;c < data.t.length;c++){
		console.log(called.indexOf(data.t[c])==-1);
		if(called.indexOf(data.t[c])==-1){
			boo=false;
		}
	}
			if(boo){
				io.sockets.emit('win',{nm:playerList[this.id]});
			}
	});
	

	
/*	socket.on('addCalled',function(data){
		if(modList[this.id] == "say you" || modList[this.id]=="so cool"){
			called.push(parseInt(data.number));
		}
		console.log(called);
	});*/


});