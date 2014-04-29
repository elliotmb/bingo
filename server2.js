// own modules
var FileServer = require('./module/fileServer');
var ChatServer = require('./module/bingoServer');

var fileServer = new FileServer(843);
var bingoServer = new bingoServer(fileServer, {'log level': 1});