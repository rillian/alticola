// Node + Redis shared lightbulb switch

var http = require('http');
var WebSocketServer = require('websocket').server;
var redis = require('redis').createClient();

var exec = require('child_process').exec;

var redis_key = 'demo:20130308:lamp';

redis.debug_mode = true;

redis.on('error', function(err) {
  console.log((new Date()) + 'redis error: ' + err);
});

var server = http.createServer(function(request, response) {
  response.writeHead(200, {'Content-Type': 'text/plain'});

  console.log((new Date()) + ' connection ' + request.connection.remoteAddress);
  redis.incr('hello:requests', function(err, reply) {
    response.write('Hello ' + reply + ' from node.js.\n');
    response.end();
  });

}).listen(8888, function() {
  console.log((new Date()) + ' server listening.');
});

var ws = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});

function ws_origin(origin) {
  // TODO: Verify correct origin.
  return true;
}

ws.on('request', function(request) {
  if (!ws_origin(request.origin)) {
    request.reject();
    console.log((new Date()) + ' connection from ' + request.origin + ' rejected.');
    return;
  }

var connection = request.accept('lamp', request.origin);
  console.log((new Date()) + ' connection ' + request.remoteAddress +
                       ' ' + request.origin + ' accepted.');
  connection.on('message', function(message) {
    console.log((new Date()) + ' recving ' + message.utf8Data);
    exec('sudo /home/pi/alticola/lamp.sh ' + message.utf8Data, function(error, stdout, stderr) {
      if (stdout)
        console.log('exec: ' + stdout);
      if (stderr)
        console.log('exec: ' + stderr);
      if (error) {
        console.log('exec error: ' + error);
      }
    });
    // Save the state for new connections.
    redis.set(redis_key, message.utf8Data);
    // Send the state to existing connections.
    redis.publish(redis_key, message.utf8Data);
  });
  connection.on('close', function(reason, description) {
    console.log((new Date()) + ' connection ' + request.remoteAddress + ' closed.');
  });

  var sub = require('redis').createClient();

  sub.on('message', function (channel, message) {
    console.log((new Date()) + ' sending ' + message);
    connection.send(message);
  });
  sub.subscribe(redis_key);

  // We also have to send the current state.
  redis.get(redis_key, function(err, reply) {
    if (reply) {
      connection.send(reply);
    }
  });
  sub.on('error', function(err) {
    console.log((new Date()) + 'redis error: ' + err);
  });

});
