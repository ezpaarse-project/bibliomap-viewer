
var config     = require('./config.js');
var path       = require('path');
var es         = require('event-stream');
var JSONStream = require('JSONStream');
var debug      = require('debug')('bibliomap-viewer');

// list of connected websockets
var websockets = {};

/**
 * bibliomap-enricher => bibliomap-viewer
 */
var net = require('net');
var server = net.createServer(function (socket) { //'connection' listener
  console.log('bibliomap-enricher connected');
  socket.on('end', function() {
    console.log('bibliomap-enricher disconnected');
  });

  // get and parse the bibliomap-enricher JSON stream
  // then send it to the browser
  socket
    .pipe(JSONStream.parse())
    .pipe(es.mapSync(function (ezpaarseEC) {
      for (var clientId in websockets) {
        // filter sensitive data
        [ 'host', 'login', 'geoip-host', 'user', 'unit', 'OU' ].forEach(function (ecFieldToDelete) {
          delete ezpaarseEC[ecFieldToDelete];
        });
        
        debug('ezPAARSE EC recevied: ', ezpaarseEC);

        // send the filtered EC to the client through websocket
        websockets[clientId].emit('ezpaarse-ec', ezpaarseEC);
      }
    }));

});
server.listen(config.listen['bibliomap-enricher'].port,
              config.listen['bibliomap-enricher'].host, function () { 
  console.log('Waiting for bibliomap-enricher data at ' + config.listen['bibliomap-enricher'].host + ':' + config.listen['bibliomap-enricher'].port);
});


/**
 * bibliomap => web browser through websocket
 */
var express    = require('express');
var app        = express();
var httpServer = require('http').Server(app);
var io         = require('socket.io')(httpServer);

httpServer.listen(config.listen['bibliomap-viewer'].port, config.listen['bibliomap-viewer'].host);

app.get('/', function (req, res) {
  res.header('X-UA-Compatible', 'IE=edge');
  res.sendFile(path.join(__dirname, '/' + config.index));
});
app.get('/bibliomap.js', function (req, res) {
  res.sendFile(path.join(__dirname, '/' + config.jsfile));
});
app.use('/', express.static(path.join(__dirname, '/public')));
app.use(function (req, res, next) { res.status(404).end(); });

io.on('connection', function (client) {
  console.log('Web browser connected through websocket ' + client.id);
  websockets[client.id] = client;
  client.on('disconnect', function () {
    console.log('Web browser disconnected from the websocket ' + client.id);
    delete websockets[client.id];
  });
});

console.log('Bibliomap is listening on http://' + config.listen['bibliomap-viewer'].host +
  ':' + config.listen['bibliomap-viewer'].port + ' (open it with your browser!)');

// exit on CTRL+C
exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');
function exitOnSignal(signal) {
  process.on(signal, function() {
    console.log('Caught ' + signal + ', exiting');
    // todo: stop here all critical tasks before exiting the process
    process.exit(1);
  });
}