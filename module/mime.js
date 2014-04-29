var path = require('path');

var extMap = {
    '.html': 'text/html',
    '.htm':  'text/html',
    '.txt':  'text/plain',
    '.png':  'image/png',
    '.js':   'application/javascript',
    '.css':  'text/css'
};

var defaultMime = extMap['.html'];

/**
 * Gets a mimetype based on file extension
 *
 * @param filePath The path to the file
 * @param fallback The fallback mimetype if not found (optional)
 * @return The cooresponding mimetype
 */
function lookup(filePath, fallback) {
    var ext = path.extname(filePath);
    return extMap[ext] || fallback || defaultMime;
}

module.exports = {
    lookup: lookup
};