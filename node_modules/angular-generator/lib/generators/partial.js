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
  var options, codePath, testPath, stylePath, htmlPath;

  var values = {
    name: namer.controller(name),
    folder: namer.file(name),
    filename: namer.file(namer.controller(name))
  };

  log.info('Creating partial: ' + name.cyan);

  return init.load()
    .then(function (_options) {
      options = _options;
      values.module = options.module;
      return fileHelper.getTemplates('partial', values);
    })
    .then(function (templates) {
      return templates.reduce(function (map, tmpl) {
        map[tmpl.name] = tmpl;
        return map;
      }, {});
    })
    .then(function (tmplMap) {
      codePath = path.resolve(process.cwd(), options.sourceFolder, 'partials', values.folder, values.filename + '.js'),
      testPath = path.resolve(process.cwd(), options.testFolder, 'unit', 'controllers', values.filename + '.js'),
      stylePath = path.resolve(process.cwd(), options.sourceFolder, 'partials', values.folder, values.folder),
      htmlPath = path.resolve(process.cwd(), options.sourceFolder, 'partials', values.folder, values.folder + '.html');
      
      return q.all([
        fileHelper.saveFile(codePath, tmplMap['template.js'].content),
        fileHelper.saveFile(testPath, tmplMap['test.js'].content),
        fileHelper.saveFile(stylePath + '.' + options.cssPrecompiler, ''),
        fileHelper.saveFile(htmlPath, tmplMap['template.html'].content)
      ]);
    })
    .then(function () {
      return q.all([
        scriptHelper.insertScripts({
          name: values.filename,
          type: 'partial',
          codePath: 'partials/' + values.folder,
          testPath: 'controllers'
        }),
        scriptHelper.insertImport(stylePath)
      ]);
    });
};