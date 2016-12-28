
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
  console.log('ezpaarse2log.io connected');
  socket.on('end', function() {
    console.log('ezpaarse2log.io disconnected');
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
server.listen(config.listen['ezpaarse2log.io'].port,
              config.listen['ezpaarse2log.io'].host, function () { 
  console.log('Waiting for ezpaarse2log.io data at ' + config.listen['ezpaarse2log.io'].host + ':' + config.listen['ezpaarse2log.io'].port);
});


/**
 * bibliomap => web browser through websocket
 */
var express    = require('express');
var app        = express();
var httpServer = require('http').Server(app);
var io         = require('socket.io')(httpServer);

httpServer.listen(config.listen.bibliomap.port, config.listen.bibliomap.host);

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

console.log('Bibliomap is listening on http://' + config.listen.bibliomap.host +
  ':' + config.listen.bibliomap.port + ' (open it with your browser!)');

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