// Based on the following resurces
// http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/
//https://stackoverflow.com/questions/16333790/node-js-quick-file-server-static-files-over-http

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const mustache = require('mustache');
var minify = require('html-minifier').minify;
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
    } else if (fileInPages.exist) {
        //If exist on the page folder
        sendPage(fileInPages.pathname, res);
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
            '.htm': 'text/html',
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

        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        var data;
        if (ext == '.html' || ext == '.htm') {
            // read file from file system as a string
            data = fs.readFileSync(pathname, "utf8");
            // Minify HTML
            data = minify(data, {
                minifyJS: true,
                minifyCSS: true
            });
        } else {
            // read file from file system as a buffer
            data = fs.readFileSync(pathname);
        }

        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain');
        res.end(data);
    } catch (error) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${error}.`);
    }
};

//Function to send a file on the public folder
var sendPage = function(pathname, res) {
    try {
        // read file from file system
        var data = fs.readFileSync(pathname, "utf8");
        // split files by lines
        var dataLines = data.split(/\r?\n/);

        //check first line if it has a layout
        var hasLayout = dataLines[0].indexOf("<!-- layout:") !== -1;
        if (hasLayout) {
            var layout = getLayout(dataLines[0]);
            var body = "";
            for (var index = 1; index < dataLines.length; index++) {
                body += dataLines[index] + "\n";
            }
            data = mustache.to_html(layout, { body: body });
        }

        // Minify HTML
        data = minify(data, {
            removeComments: false,
            minifyJS: true,
            minifyCSS: true
        });

        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', 'text/html');
        res.end(data);
    } catch (error) {
        res.statusCode = 500;
        res.end(`Error getting the file: ${error}.`);
    }
};

var getLayout = function(layoutInfo) {
    try {
        var data = '{{{body}}}'
        var pathname = layoutInfo.replace('<!-- layout: ', '').replace(' -->', '').replace(' ', '');

        var fileInfo = verifyPath(`./layouts/${pathname}`);
        if (fileInfo.exist) {
            data = fs.readFileSync(fileInfo.pathname, "utf8");
        };
        return data;
    } catch (error) {
        return "{{{body}}}";
    }
};