var defaultConfig = {
  debug: false,
  index: 'index-cnrs.html',
  bibliomap: 'bibliomap-cnrs.js'
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