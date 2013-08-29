var http = require('http');
var fs = require('fs');

var cfg = {
    port: 1338,
    host: '0.0.0.0',
    resultsFile: __dirname + '/../../results.json',
    testBytes: (function() {
        var names = [];
        // http://en.wikipedia.org/wiki/Byte_order_mark
        var boms = [];
        names.push('no-bom');
        boms.push([]);
        names.push('utf-8');
        boms.push([0xEF, 0xBB, 0xBF]);
        names.push('utf-16be');
        boms.push([0xFE, 0xFF]);
        names.push('utf-16le');
        boms.push([0xFF, 0xFE]);
        names.push('utf-32be');
        boms.push([0x00, 0x00, 0xFE, 0xFF]);
        names.push('utf-32le');
        boms.push([0xFF, 0xFE, 0x00, 0x00]);
        names.push('utf-7');
        boms.push([0x2B, 0x2F, 0x76, 0x38]);
        boms.push([0x2B, 0x2F, 0x76, 0x39]);
        boms.push([0x2B, 0x2F, 0x76, 0x2B]);
        boms.push([0x2B, 0x2F, 0x76, 0x2F]);
        boms.push([0x2B, 0x2F, 0x76, 0x38, 0x2D]);
        names.push('utf-1');
        boms.push([0xF7, 0x64, 0x4C]);
        names.push('utf-ebcdic');
        boms.push([0xDD, 0x73, 0x66, 0x73]);
        names.push('scsu');
        boms.push([0x0E, 0xFE, 0xFF]);
        names.push('bocu-1');
        boms.push([0xFB, 0xEE, 0x28]);
        names.push('gb-18030');
        boms.push([0x84, 0x31, 0x95, 0x33]);

        var bytes = [], i;
        for(i = 0; i < 8; i += 1) {
            bytes.push(0);
        }
        for(i = 255; i >= 0; i -= 1) {
            bytes.push(i);
        }
        for(i = 0; i <= 255; i += 1) {
            bytes.push(i);
        }

        var tests = {};
        boms.forEach(function(bom, i) {
            var test = [];
            test.push.apply(test, bom);
            test.push.apply(test, bytes);
            tests[names[i]] = test;
        });
        return tests;
    })()
};

var respondBuffer = function(res, buffer, mimeType) {
    res.writeHead(200, {
        'Content-Type': mimeType,
        'Content-Length': buffer.length
    });
    res.end(buffer);
};

var respondFile = function(res, filename, mimeType) {
    fs.readFile(filename, function(err, file) {
        if(err) {
            res.writeHead(500);
            res.end();
            return;
        }
        respondBuffer(res, file, mimeType);
    });
};

var respondStatus = function(res, statusCode) {
    res.writeHead(statusCode);
    res.end();
};

var postResults = function(res, req, results) {
    var chunks = [];
    req.on('data', function(chunk) {
        chunks.push(chunk);
    });
    req.on('end', function() {
        var result = JSON.parse(Buffer.concat(chunks).toString());
        result.userAgent = req.headers['user-agent'];
        result.time = Date.now();
        if(results.every(function(_result) {
            return result.userAgent !== _result.userAgent;
        })) {
            results.push(result);
        }
        var buffer = new Buffer(JSON.stringify(results));
        fs.writeFile(cfg.resultsFile, buffer, function(err, file) {
            if(err) {
                console.log('Received result cannot be saved because of error:', err);
            }
            respondBuffer(res, buffer, 'application/json');
        });
    });
};

var respondResultsByUserAgent = function(res, userAgent, results) {
    for(var i = 0; i < results.length; i += 1) {
        if(results[i].userAgent === userAgent) {
            respondBuffer(res, new Buffer(JSON.stringify(results[i])), 'application/json');
            return;
        }
    }
    respondStatus(res, 404);
};

var beginsWith = function(str, substr) {
    return str.substr(0, substr.length) === substr;
};

fs.readFile(cfg.resultsFile, function(err, file) {
    if(err) {
        console.log('Creating new results file "' + cfg.resultsFile + '" because of error:', err);
        file = new Buffer('[]');
    }
    var results = JSON.parse(file.toString());
    http.createServer(function(req, res) {
        if(req.method === 'GET') {
            if(req.url === '/') {
                respondFile(res, __dirname + '/../client/index.html', 'text/html; charset=UTF-8');
            } else if(req.url === '/result') {
                respondBuffer(res, new Buffer(JSON.stringify(results)), 'application/json');
            } else if(beginsWith(req.url, '/result/by-userAgent/')) {
                respondResultsByUserAgent(res, decodeURIComponent(req.url.substr('/result/by-userAgent/'.length)), results);
            } else if(req.url === '/script.js') {
                respondFile(res, __dirname + '/../client/script.js', 'text/javascript; charset=UTF-8');
            } else if(req.url === '/json2.js') {
                respondFile(res, __dirname + '/../client/json2.js', 'text/javascript; charset=UTF-8');
            } else if(beginsWith(req.url, '/data/')) {
                respondBuffer(res, new Buffer(cfg.testBytes[req.url.substr('/data/'.length)]), 'application/octet-stream');
            } else {
                respondStatus(res, 404);
            }
        } else if(req.method === 'POST') {
            if(req.url === '/result') {
                postResults(res, req, results);
            } else {
                respondStatus(res, 404);
            }
        } else {
            respondStatus(res, 406);
        }
    }).listen(cfg.port, cfg.host);
    console.log('test-browser-charsets is ready, now open all your web browsers and send them to http://' + cfg.host + ':' + cfg.port + '/');
});
