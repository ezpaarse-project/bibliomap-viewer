var defaultConfig = {
  debug: false,
  index: 'index-cnrs.html',
  bibliomap: {
  	host: '127.0.0.1',
  	port: '50197',
  	js: 'bibliomap-cnrs.js'
  },
  listen: {
    // listen for harvested logs
    ezpaarse2logio: {
      host: '127.0.0.1',  // adjust where log-io.harvester is located
      port: 28779         // this is the default log.io-harvester destination port
    }
  }
};

// to allow config overloading 
// by a local config file
var nconf   = require('nconf');
var localConf = {};
try {
  localConf = require('./config.local.js');
} catch (err) { }
 
nconf.argv()
     .env()
     .overrides(localConf)
     .defaults(defaultConfig);

module.exports = nconf.get();