var io = require('socket.io');

function bingoServer(port, args) {
    this.users = {};
    this.userSockets = {};
    this.rooms = {};
    this.roomNames = [];
    this.mainRoom = new Room('Main');
    this.addRoom(this.mainRoom);
    this.socket = io.listen(port, args);

    this.setUpSocketListener();
}

/**
 *  Sets up the socket and what to listen for
 */
bingoServer.prototype.setUpSocketListener = function() {
    var self = this;

    this.socket.on('connection', function(client) {
        console.log(client.id + ' has connected');
        client.join(self.mainRoom.name);
        

        client.on(Packet.USER_AUTH_NEW, function(data) {
            console.log('Received USER_AUTH_NEW Packet:');
            console.log(data);

            // Make sure it's actually a new user, and not another person in console
            if (self.getUserIdBySocketId(client.id)) {
                console.log('Invalid username');
                client.emit(Packet.USER_AUTH_RESPONSE, { err: 'Unauthorized request', errCode: 5 });
            } else {
                // needs data.userName
                if (!data.userName || data.userName.trim().length === 0) {
                    console.log('Unauthorized request');
                    client.emit(Packet.USER_AUTH_RESPONSE, { err: 'Invalid username', errCode: 1 });
                } else if (self.users.hasOwnProperty(data.userName.toLowerCase())) {
                    console.log('Username already taken');
                    client.emit(Packet.USER_AUTH_RESPONSE, { err: 'Username already taken', errCode: 2 });
                } else {
                    // Make the new user
                    var newUser = new User(data.userName, client.id);
                    // Add them to the users collection
                    self.addUser(newUser);
                    // respond to the client that that data is valid
                    client.emit(Packet.USER_AUTH_RESPONSE, { user: newUser, room: self.mainRoom });
                    // Add the client to the main room (default)
                    // self.rooms[self.mainRoom.id].addUser(newUser);
                    self.rooms[self.mainRoom.id].addUser(newUser);
                    // User joins main room
                    client.join(self.mainRoom.name);
                    // Broadcast to the room that user has joined
                    self.socket.sockets.in(self.mainRoom.name).emit(Packet.USER_JOIN_ROOM, { user: newUser });
                }
            }
        });

        // Yeah, I know, basically a copy/paste of above. YOLO
        client.on(Packet.USER_AUTH_EXISTING, function(data) {
            console.log('Received USER_AUTH_EXISTING Packet:');
            console.log(data);

            // Make sure it's actually a "new" user, and not another person in console
            if (self.getUserIdBySocketId(client.id)) {
                console.log('Unauthorized request');
                client.emit(Packet.USER_AUTH_RESPONSE, { err: 'Unauthorized request', errCode: 5 });
            } else {
                if (!data.userName || data.userName.trim().length === 0) {
                    console.log('Invalid username');
                    client.emit(Packet.USER_AUTH_RESPONSE, { err: 'Invalid username', errCode: 1 });
                } else if (self.users.hasOwnProperty(data.userName.toLowerCase())) {
                    console.log('Username has been taken');
                    client.emit(Packet.USER_AUTH_RESPONSE, { err: 'Username has been taken', errCode: 2 });
                } else {
                    // Make the new user
                    var newUser = new User(data.userName, client.id);
                    // Add them to the users collection
                     self.addUser(newUser);
                    // Make sure a valid room, again, default to mainRoom
                    var newRoom = self.mainRoom;
                    if (data.roomId !== self.mainRoom.id && self.rooms.hasOwnProperty(data.roomId)) {
                        newRoom = self.rooms[data.roomId];
                    }
                    // respond to the client that that data is valid
                    client.emit(Packet.USER_AUTH_RESPONSE, { user: newUser, room: newRoom });
                    // Add the client to the new room
                    self.rooms[newRoom.id].addUser(newUser);
                    // User joins the new room
                    client.join(self.mainRoom.name);
                    // Broadcast to the room that user has joined
                    self.socket.sockets.in(newRoom.name).emit(Packet.USER_JOIN_ROOM, { user: newUser });
                }
            }
        });

        client.on(Packet.USER_CHANGE_ROOM, function(data) {
            console.log('Received USER_CHANGE_ROOM Packet:');
            console.log(data);

            // Make sure the data object is good
            if (!data.roomName || data.roomName.trim().length() === 0) {
                client.emit(Packet.USER_CHANGE_ROOM_RESPONSE, { err: 'Invalid room name', errCode: 3 });
            }

            if (!(data.user && data.user.id)) {
                client.emit(Packet.USER_CHANGE_ROOM_RESPONSE, { err: 'Invalid user', errCode: 4 });
            } else if (!self.users.hasOwnProperty(data.user.id)) {
                client.emit(Packet.USER_CHANGE_ROOM_RESPONSE, { err: 'User does not exist?!? Umm yeah...', errCode: 5 });
            }

            // Make sure it's actually the correct user, and not a h4x0r
            var registeredUserId = self.getUserIdBySocketId(client.id);
            if (registeredUserId && registeredUserId === data.user.id) {
                var newRoom = self.getRoomByName(data.roomName);
                if (!newRoom) {
                    client.emit(Packet.USER_CHANGE_ROOM_RESPONSE, { err: 'Invalid room name', errCode: 3 });
                } else {
                    // Get the user's old room. Will have an old room if user exists
                    var oldRoom = self.getRoomByUser(data.user);
                    // Move user in memory to new room
                    self.rooms[oldRoom.id].removeUser(data.user);
                    self.rooms[newRoom.id].addUser(data.user);
                    // Change socketio channels
                    client.leave(oldRoom.name);
                    client.join(newRoom.name);
                    // Tell user it was successfull
                    client.emit(Packet.USER_CHANGE_ROOM_RESPONSE, { room: newRoom });
                    // Broadcast to rooms
                    self.socket.sockets.in(oldRoom.name).emit(Packet.USER_LEAVE_ROOM, { user: data.user });
                    self.socket.sockets.in(newRoom.name).emit(Packet.USER_JOIN_ROOM, { user: data.user });
                }
            } else {
                // Send alert packet here
            }
        });

        client.on(Packet.USER_DISCONNECTING, function(data) {
            console.log('Received USER_DISCONNECTING Packet:');
            console.log(data);

            // If the user object is alright
            if (data.user && data.user.name) {
                var user = data.user;

                // Make sure it's actually the correct user, and not a h4x0r
                var registeredUserId = self.getUserIdBySocketId(client.id);
                if (registeredUserId && registeredUserId === user.id) {
                    // Remove from users if it exists
                    if (self.users.hasOwnProperty(user.name)) {
                         self.removeUser(user);
                    }

                    // Find user's room and remove him
                    var userRoom = self.getRoomByUser(user);
                    if (userRoom) {
                        // This is already done by socketio, but just incase the user
                        // is smart and is using console or something
                        client.leave(userRoom.name);
                        // Remove user from the actual room object
                        userRoom.removeUser(user);
                        self.socket.sockets.in(userRoom.name).emit(Packet.USER_LEAVE_ROOM, { user: user });
                    } else {
                        console.log('did not find user room');
                    }
                } else {
                    // Send alert packet here
                }
            }
        });

        client.on(Packet.ROOMS_UPDATE_REQUEST, function() {
            console.log('Received ROOMS_UPDATE_REQUEST Packet:');
            client.emit(Packet.ROOMS_UPDATE, { rooms: self.roomNames });
        });

        client.on(Packet.CHAT_MESSAGE, function(data) {
            console.log('Received CHAT_MESSAGE Packet:');
            console.log(data);

            if (data.user && data.user.id) {
                var user = data.user;

                // Make sure it's actually the correct user, and not a h4x0r
                var registeredUserId = self.getUserIdBySocketId(client.id);
                if (registeredUserId && registeredUserId === user.id) {
                    var userRoom = self.getRoomByUser(data.user);
                    if (userRoom) {
                        self.socket.sockets.in(userRoom.name).emit(Packet.CHAT_MESSAGE, data);
                    }
                } else {
                    // Send alert packet here
                }
            }
        });
    });
};

module.exports = bingoServer;