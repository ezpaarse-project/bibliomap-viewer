var es                = require('event-stream'); 
var JSONStream        = require('JSONStream');


var net = require('net');
var server = net.createServer(function (socket) { //'connection' listener
  console.log('server connected');
  socket.on('end', function() {
    console.log('server disconnected');
  });

  socket
    .pipe(JSONStream.parse())
    .pipe(es.mapSync(function (ezpaarseEC) {
      console.log(ezpaarseEC);
    }));


  //c.write('hello\r\n');
  //c.pipe(c);
});
server.listen(28779, '127.0.0.1', function () { //'listening' listener
  console.log('server bound');
});