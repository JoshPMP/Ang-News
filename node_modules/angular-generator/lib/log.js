var colors = require('colors');

var sender = '['.white + 'generator'.blue + '] '.white;

function isTest() {
  return process.env.NODE_ENV === 'test';
}

var log = {
  info: function (msg) {
    if(!isTest() && log.options.info) { console.log(sender + msg); }
  },
  warn: function (msg) {
    if(!isTest() && log.options.warn) { console.log(sender + 'Warning: '.yellow + msg); }
  },
  error: function (msg) {
    if(!isTest() && log.options.error) { console.error(sender + 'Error: '.red + msg); }
  },
  options: {
    info: true,
    warn: true,
    error: true
  }
};

module.exports = log;