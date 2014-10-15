var es                = require('event-stream'); 
var JSONStream        = require('JSONStream');

// list of connected websockets
var websockets = {};

/**
 * ezpaarse2log.io => bibliomap
 */
var net = require('net');
var server = net.createServer(function (socket) { //'connection' listener
  console.log('server connected');
  socket.on('end', function() {
    console.log('server disconnected');
  });

  // get and parse the ezpaarse2log.io JSON stream
  // then send it to the browser
  socket
    .pipe(JSONStream.parse())
    .pipe(es.mapSync(function (ezpaarseEC) {
      Object.keys(websockets).forEach(function (clientId) {
        // filter sensitive data
        [ 'host', 'login', 'geoip-host' ].forEach(function (ecFieldToDelete) {
          delete ezpaarseEC[ecFieldToDelete];
        });
        // send the filtered EC to the client through websocket
        websockets[clientId].emit('ezpaarse-ec', ezpaarseEC);
      });
    }));

});
server.listen(28779, '127.0.0.1', function () { //'listening' listener
  console.log('server bound');
});


/**
 * bibliomap => web browser through websocket
 */
var app = require('express')();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);

httpServer.listen(50197);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/bibliomap.js', function (req, res) {
  res.sendFile(__dirname + '/bibliomap.js');
});

io.on('connection', function (client) {
  console.log('Client connected ' + client.id);
  websockets[client.id] = client;
  client.on('disconnect', function () {
    console.log('Client disconnected ' + client.id);
    delete websockets[client.id];
  });
});

