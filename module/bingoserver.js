var io = require('socket.io');

function bingoServer(port, args) {
    this.users = {};
    this.userSockets = {};
    this.socket = io.listen(port, args);
    this.setUpSocketListener();
}

/**
 *  Sets up the socket and what to listen for
 */
bingoServer.prototype.setUpSocketListener = function() {
    var self = this;

	this.sockets.on('connection', function (client) {

	    client.emit('news', {
	        hello: 'world'
	    });

	    /*
	     * Adds new chat messages to the chat
	     */
	    client.on('send',function(data){
	        this.sockets.emit('chatIn',{user:playerList[this.id], message:data.message});
	    });

	    /*
	     * Adds a player with a new randomized board to the game, checks for admin accts and
	     * adds them to the game accordingly 
	     */
	    client.on('addPlayer', function (data) {
			console.log(data);
			if(data.username == "say you" || data.username == "so cool"){
				playerList[this.id] = (data.username=="say you")?"Yz":"Lkz";
				modList[this.id] = data.username;
				client.emit('adminS',{});
			}else{
				playerList[this.id] = data.username;
				client.emit('basicS',{});
				console.log(playerList);
			}
	    });

	    /*
	     * Checks if someone has won the game yet based on the tiles called by the admin
	     */
		client.on('checkMaster', function(data){
		var boo=true;
		console.log(data.t);
		for(var c = 0;c < data.t.length;c++){
			console.log(called.indexOf(data.t[c])==-1);
			if(called.indexOf(data.t[c])==-1){
				boo=false;
			}
		}
				if(boo){
					this.sockets.emit('win',{nm:playerList[this.id]});
				}
		});
		
		/*
	     * Adds to list of valid tiles when on an admin acct
	     */
		client.on('addCalled',function(data){
			if(modList[this.id] == "say you" || modList[this.id]=="so cool"){
				called.push(parseInt(data.number));
			}
			client.broadcast.emit('callback',{stuff:'stuff'});
			console.log(called);
		});


	});

};

module.exports = bingoServer;