var path       = require('path');
var es         = require('event-stream');
var JSONStream = require('JSONStream');

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
      for (var clientId in websockets) {
        // filter sensitive data
        [ 'host', 'login', 'geoip-host' ].forEach(function (ecFieldToDelete) {
          delete ezpaarseEC[ecFieldToDelete];
        });
        // send the filtered EC to the client through websocket
        websockets[clientId].emit('ezpaarse-ec', ezpaarseEC);
      }
    }));

});
server.listen(28779, '127.0.0.1', function () { //'listening' listener
  console.log('Waiting for logs on 127.0.0.1:28779');
});


/**
 * bibliomap => web browser through websocket
 */
var express    = require('express');
var app        = express();
var httpServer = require('http').Server(app);
var io         = require('socket.io')(httpServer);

httpServer.listen(50197);

app.get('/', function (req, res) {
  res.header('X-UA-Compatible', 'IE=edge');
  res.sendFile(path.join(__dirname, '/index.html'));
});
app.get('/bibliomap.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/bibliomap.js'));
});
app.use('/images', express.static(path.join(__dirname, '/images')));
app.use('/images', function (req, res, next) { res.status(404).end(); });
app.use('/js', express.static(path.join(__dirname, '/js')));
app.use('/js', function (req, res, next) { res.status(404).end(); });

io.on('connection', function (client) {
  console.log('Client connected ' + client.id);
  websockets[client.id] = client;
  client.on('disconnect', function () {
    console.log('Client disconnected ' + client.id);
    delete websockets[client.id];
  });
});

console.log('Server listening on http://localhost:50197');
