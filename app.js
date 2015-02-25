
var config     = require('./config.js');
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
server.listen(config.listen.ezpaarse2logio.port, config.listen.ezpaarse2logio.host, function () { 
  //'listening' listener
  console.log('Waiting for logs on ' + config.listen.ezpaarse2logio.host + ':' + config.listen.ezpaarse2logio.port);
});


/**
 * bibliomap => web browser through websocket
 */
var express    = require('express');
var app        = express();
var httpServer = require('http').Server(app);
var io         = require('socket.io')(httpServer);

httpServer.listen(config.bibliomap.port, config.bibliomap.host);

app.get('/', function (req, res) {
  res.header('X-UA-Compatible', 'IE=edge');
  res.sendFile(path.join(__dirname, '/' + config.index));
});
app.get('/bibliomap.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/' + config.bibliomap.js));
});
app.use('/', express.static(path.join(__dirname, '/public')));
app.use(function (req, res, next) { res.status(404).end(); });

io.on('connection', function (client) {
  console.log('Client connected ' + client.id);
  websockets[client.id] = client;
  client.on('disconnect', function () {
    console.log('Client disconnected ' + client.id);
    delete websockets[client.id];
  });
});

console.log('Server listening on http://' + config.bibliomap.host +
  ':' + config.bibliomap.port);
