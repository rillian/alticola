var http = require("http");
var redis = require("redis").createClient();

redis.debug_mode = true;

redis.on('error', function(err) {
  console.log("redis error: " + err);
});

http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  console.log('connection ' + request.connection.remoteAddress);
  redis.incr('hello:requests', function(err, reply) {
    response.write('Hello ' + reply + ' from node.js.\n');
    response.end();
  });

}).listen(8888);
