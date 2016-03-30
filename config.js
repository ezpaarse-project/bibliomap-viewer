var defaultConfig = {
  debug: false,
  index: 'index-cnrs.html',
  bibliomap: {
  	host: '0.0.0.0', // listen everywhere
  	port: 50197,
  	js:   process.env.BIBLIOMAP_JS   ? process.env.BIBLIOMAP_JS   : 'bibliomap-cnrs.js'
  },
  listen: {
    // listen for harvested logs
    ezpaarse2logio: {
      // adjust where log-io.harvester is located
      host: '0.0.0.0', // listen everywhere
      // this is the default log.io-harvester destination port
      port: 28779
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