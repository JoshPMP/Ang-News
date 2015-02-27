var q = require('q'),
  program = require('commander'),
  init = require('./init'),
  log = require('./log'),
  pkg = require('../package.json');

function generate() {
  program
    .version(pkg.version)
    .usage('generator [options]')
    .option('-i --init', 'Initialize app')
    .option('-p --partial [name]', 'Create a partial (controller + html + css + [route])')
    .option('-c --controller [name]', 'Create a controller')
    .option('-s --service [name]', 'Create a service')
    .option('-d --directive [name]', 'Create a directive')
    .option('-f --filter [name]', 'Create a filter')
    .option('-m --model [name]', 'Create a model')
    .option('-C --constant [name]', 'Create a constant')
    .parse(process.argv);

  if(process.argv.indexOf('-h') > -1 || process.argv.indexOf('--help') > -1) {
    program.help();
  }
  if(process.argv.indexOf('-V') > -1 || process.argv.indexOf('--version') > -1) {
    program.emit('version');
  }

  var result = q();

  var generators = [
    'partial',
    'controller',
    'service',
    'directive',
    'filter',
    'model',
    'constant'
  ];

  // run init
  if(!init.isInitialized() || program.init !== undefined) {
    result = result.then(init.initialize.bind(init));
  }

  // run generators
  generators.forEach(function (generator) {
    if(program[generator] !== undefined) {
      var func = require('./generators/' + generator);
      result = result.then(func.bind(func, program[generator]));
    }
  });

  return result
    .catch(function (err) {
      log.error(err);
    });
}

module.exports = {
  generate: generate,
  init: init
};