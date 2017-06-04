// Based on the following resurces
// http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/
//https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
// you can pass the parameter in the command line. e.g. node static_server.js 3000
const port = process.argv[2] || 9000;
http.createServer(function(req, res) {
    console.log(`${req.method} ${req.url}`);
    /************************************************************/
    //To overcome the CORS
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow ( 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    /************************************************************/

    // parse URL
    const parsedUrl = url.parse(req.url);
    // extract URL path
    let pathname = parsedUrl.pathname;
    let publicPathName = `./public${pathname}`;
    let pagesPathName = `./pages${pathname}`;
    let fileInPages = false;

    //Verify if path exist in public folder
    let fileInPublic = verifyPath(publicPathName);

    //If doesn't exist in public verify if path exist on pages folder
    if (!fileInPublic.exist) fileInPages = verifyPath(pagesPathName);

    //If exist on the public folder
    if (fileInPublic.exist) {
        sendPublicFile(fileInPublic.pathname, res);
    } else {
        // if the file is not found, return 404
        res.statusCode = 404;
        res.end(`File ${pathname} not found!`);
    }
    return;
}).listen(parseInt(port));
console.log(`Server listening on port ${port}`);

var verifyPath = function(pathname) {
    let exist = fs.existsSync(pathname);
    if (exist) {
        // if is a directory, then look for index.html
        if (fs.statSync(pathname).isDirectory()) {
            let s = pathname.substr(pathname.length - 1) == '/' ? "" : "/";
            pathname += s + 'index.html';
            exist = fs.existsSync(pathname)
        }
    }
    return { 'exist': exist, 'pathname': pathname };
};

//Function to send a file on the public folder
var sendPublicFile = function(pathname, res) {
    try {
        // maps file extention to MIME types
        const mimeType = {
            '.ico': 'image/x-icon',
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.json': 'application/json',
            '.css': 'text/css',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.wav': 'audio/wav',
            '.mp3': 'audio/mpeg',
            '.svg': 'image/svg+xml',
            '.pdf': 'application/pdf',
            '.doc': 'application/msword',
            '.eot': 'appliaction/vnd.ms-fontobject',
            '.ttf': 'aplication/font-sfnt'
        };

        // read file from file system
        var data = fs.readFileSync(pathname);
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
    } catch (error) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${error}.`);
    }
};