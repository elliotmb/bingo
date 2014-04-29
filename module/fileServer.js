var http = require('http');
var url = require('url');
var fs = require('fs');

var mime = require('./mime');

function FileServer(port) {
    var server = http.createServer(function(req, res) {
        var filePath = req.url;
        // default to index if root request
        if (filePath === '/') {
            filePath = './index.html';
        } else {
            filePath = './' + req.url 
        }
        fs.exists(filePath, function (exists) {
            if (exists) {
                res.writeHeader(200, {'Content-Type': mime.lookup(filename)});
                fs.createReadStream(filename).pipe(res);
            } else {
                res.writeHeader(404, {'Content-Type': 'text/html'});
                res.end('File not found');
            }
        });
    });

    return server.listen(port || 843);
}

module.exports = FileServer;
