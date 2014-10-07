var net = require('net');
var server = net.createServer(function(c) { //'connection' listener
  console.log('server connected');
  c.on('end', function() {
    console.log('server disconnected');
  });
  c.on('data', function (chunk) {
    console.log('chunk', '' + chunk);
  });
  //c.write('hello\r\n');
  //c.pipe(c);
});
server.listen(28779, '127.0.0.1', function () { //'listening' listener
  console.log('server bound');
});