const es = require('event-stream');
const JSONStream = require('JSONStream');
const sha256 = require('sha256');
const debug = require('debug')('bibliomap-viewer');
const net = require('net');
const express = require('express');

const app = express();
const httpServer = require('http').Server(app);
const io = require('socket.io')(httpServer);
const config = require('./config.js');
const pkg = require('./package.json');

const enricherCfg = config.listen['bibliomap-enricher'];
// list of connected websockets
const websockets = {};

/**
 * bibliomap-enricher => bibliomap-viewer
 */
const server = net.createServer((socket) => { // 'connection' listener
  console.log('bibliomap-enricher connected');
  socket.on('end', () => {
    console.log('bibliomap-enricher disconnected');
  });

  // get and parse the bibliomap-enricher JSON stream
  // then send it to the browser
  socket
    .pipe(JSONStream.parse())
    .pipe(es.mapSync((event) => {
      Object.keys(websockets).forEach((sid) => {
        debug('ezPAARSE EC recevied: ', event);

        // We don't need EC's that are not geolocalized
        if (!event['geoip-latitude'] || !event['geoip-longitude']) { return; }

        // Approximate coordinates in a radius of ~20km (0.2°)
        event['geoip-latitude'] = parseFloat(event['geoip-latitude']) + 0.4 * (Math.random() - 0.5);
        event['geoip-longitude'] = parseFloat(event['geoip-longitude']) + 0.4 * (Math.random() - 0.5);

        if (event.host) {
          event.host = sha256(event.host);
        }
        // send the filtered EC to the client through websocket
        websockets[sid].emit('ezpaarse-ec', event);
      });
    }));
});

server.listen(enricherCfg.port, enricherCfg.host, () => {
  console.log(`Waiting for bibliomap-enricher data at ${enricherCfg.host}  : ${enricherCfg.port}`);
});

/**
 * bibliomap => web browser through websocket
 */
httpServer.listen(config.listen['bibliomap-viewer'].port, config.listen['bibliomap-viewer'].host);

app.set('views', `${__dirname}/themes`);
app.use(express.static(__dirname));
app.get('/', (req, res) => {
  const entity = process.env.BBV_INDEX || 'cnrs';
  res.header('X-UA-Compatible', 'IE=edge');
  return res.render('index.html.twig', { entity, version: pkg.version });
});

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

io.on('connection', (client) => {
  console.log(`Web browser connected through websocket ${client.id}`);
  websockets[client.id] = client;
  client.on('disconnect', () => {
    console.log(`Web browser disconnected from the websocket ${client.id}`);
    delete websockets[client.id];
  });
});

console.log(`Bibliomap is listening on http://${config.listen['bibliomap-viewer'].host}
  : ${config.listen['bibliomap-viewer'].port} (open it with your browser!)`);

// exit on CTRL+C
function exitOnSignal(signal) {
  process.on(signal, () => {
    console.log(`Caught ${signal}, exiting`);
    process.exit(1);
  });
}
exitOnSignal('SIGINT');
exitOnSignal('SIGTERM');
