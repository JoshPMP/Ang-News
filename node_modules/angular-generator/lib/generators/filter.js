var q = require('q'),
  fs = require('fs'),
  path = require('path'),
  colors = require('colors'),
  init = require('../init'),
  fileHelper = require('../fileHelper'),
  scriptHelper = require('../scriptHelper'),
  namer = require('../namer'),
  log = require('../log');

module.exports = function (name) {
  var options;

  var values = {
    name: namer.filter(name),
    filename: namer.file(namer.filter(name))
  };

  log.info('Creating filter: ' + name.cyan);

  return init.load()
    .then(function (_options) {
      options = _options;
      values.module = options.module;
      return fileHelper.getTemplates('filter', values);
    })
    .then(function (templates) {
      return templates.reduce(function (map, tmpl) {
        map[tmpl.name] = tmpl;
        return map;
      }, {});
    })
    .then(function (tmplMap) {
      return q.all([
        fileHelper.saveFile(
          path.resolve(process.cwd(), options.sourceFolder, 'filters', values.filename + '.js'),
          tmplMap['template.js'].content),
        fileHelper.saveFile(
          path.resolve(process.cwd(), options.testFolder, 'unit', 'filters', values.filename + '.js'),
          tmplMap['test.js'].content)
      ]);
    })
    .then(function () {
      return scriptHelper.insertScripts({
        name: values.filename,
        type: 'filter',
        codePath: 'filters',
        testPath: 'filters'
      });
    });
};