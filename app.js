
var config     = require('./config.js');
var path       = require('path');
var es         = require('event-stream');
var JSONStream = require('JSONStream');
var sha256     = require('sha256');
var debug      = require('debug')('bibliomap-viewer');

var enricherCfg = config.listen['bibliomap-enricher'];
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
    .pipe(es.mapSync(function (ec) {
      for (var clientId in websockets) {
        debug('ezPAARSE EC recevied: ', ec);

        // We don't need ECs that are not geolocalized
        if (!ec['geoip-latitude'] || !ec['geoip-longitude']) { return; }

        // Approximate coordinates in a radius of ~20km (0.2°)
        ec['geoip-latitude']  = parseFloat(ec['geoip-latitude']) + 0.4 * (Math.random() - 0.5);
        ec['geoip-longitude'] = parseFloat(ec['geoip-longitude']) + 0.4 * (Math.random() - 0.5);

        if (ec['host']) {
          ec['host'] = sha256(ec['host']);
        }

        // send the filtered EC to the client through websocket
        websockets[clientId].emit('ezpaarse-ec', ec);
      }
    }));

});
server.listen(enricherCfg.port, enricherCfg.host, function () {
  console.log('Waiting for bibliomap-enricher data at ' + enricherCfg.host + ':' + enricherCfg.port);
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
  console.log(process.env.BBV_INDEX)
  res.sendFile(path.join(__dirname, '/' + process.env.BBV_INDEX));
  
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
