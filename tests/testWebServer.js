var http = require('http');
var url = require('url');

var reqsReceived = 0;
exports.getReqsReceived = function() {
  return reqsReceived;
};
var startPageReqsReceived = 0;
exports.getStartPageReqsReceived = function() {
  return startPageReqsReceived;
};
var someotherPageReqsReceived = 0;
exports.getSomeotherPageReqsReceived = function() {
  return someotherPageReqsReceived;
};
var postsToStartPage = 0;
exports.getPostsToStartPage = function() {
  return postsToStartPage;
};
var postsToNonStringPayloadPage = 0;
exports.getPostsToNonStringPayloadPage = function() {
  return postsToNonStringPayloadPage;
};
var post = '';
exports.getPostVars = function() {
  return post;
};
var randomPayload = [];
exports.getRandomPayload = function() {
  return randomPayload;
};
var randomListPayloadRequests = [];
exports.getRandomListPayloadRequests = function() {
  return randomListPayloadRequests;
};
var headersFromGets = null;
exports.getHeadersFromGets = function() {
  return headersFromGets;
};
var headersFromPosts = null;
exports.getHeadersFromPosts = function() {
  return headersFromPosts;
};
var maxNumberOfConcurrentConnections = 0;
function setMaxNumberOfConcurrentConnections(numberOfConnections){
  if(numberOfConnections > maxNumberOfConcurrentConnections){
    maxNumberOfConcurrentConnections = numberOfConnections;
  }
}
exports.getMaxNumberOfConcurrentConnections = function() {
  return maxNumberOfConcurrentConnections;
};

exports.start = function(next) {
  console.log('.. starting http test server'.bold.inverse.cyan);
  console.log('');
  var server = http.createServer(function(req, res) {
    reqsReceived++;
    var uri = url.parse(req.url).pathname;
    if (req.method === 'GET') {
      headersFromGets = req.headers;
      if (uri == "/") {
        startPageReqsReceived++;
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('you have reached the test startpage');
      } else if (uri == "/someother") {
        someotherPageReqsReceived++;
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end('you have reached someother page');
      } else if (uri == "/another") {
        res.writeHead(200, {
          'Content-Type': 'text/html'
        });
        res.end('you have reached another page');
      } else {
        respond404(res);
      }
    } else if (req.method === 'POST') {
      headersFromPosts = req.headers;
      if (uri == "/") {
        postsToStartPage++;
        var body = '';
        req.on('data', function(data) {
          body += data;
        });
        req.on('end', function() {
          post = JSON.parse(body);
        });
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('you have sent me a POST request');
      } else if (uri == "/NonStringPayload") {
        postsToNonStringPayloadPage++;
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end();
      } else if (uri == "/Random"){
        var payload = '';
        req.on('data', function(data) {
          payload += data;
        });
        req.on('end', function() {
          randomPayload.push(payload);
        });
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('you have sent /Random a POST request');
      }
      else if (uri == "/RandomList"){
        var randomListPayload = '';
        req.on('data', function(data) {
          randomListPayload += data;
        });
        req.on('end', function() {
          randomListPayloadRequests.push(randomListPayload);
        });
        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.end('you have sent /RandomList a POST request');
      }
      else {
        respond404(res);
      }
    } else {
      respond404(res);
    }

  }).listen(5656);
  next();
  setInterval(function() {
    server.getConnections(function(err, connections) {
      if(!err){
        setMaxNumberOfConcurrentConnections(connections);
      }
    });
  }, 0);
};

function respond404(res) {
  res.writeHead(404, {
    'Content-Type': 'text/plain'
  });
  res.end('not found!');
}
