var q = require('q'),
  inquirer = require('inquirer'),
  fs = require('fs'),
  path = require('path'),
  colors = require('colors'),
  init = require('../init'),
  fileHelper = require('../fileHelper'),
  scriptHelper = require('../scriptHelper'),
  namer = require('../namer'),
  log = require('../log');

function prompt() {
  var deferred = q.defer();
  inquirer.prompt([
    {
      type: 'confirm',
      name: 'useHtml',
      message: 'Do you want a template html and css?',
      default: true
    }
  ], function (answers) {
    deferred.resolve(answers.useHtml);
  });
  return deferred.promise;
}

module.exports = function (name) {
  var options, directiveType;

  var values = {
    name: namer.directive(name),
    filename: namer.file(namer.directive(name))
  };

  log.info('Creating directive: ' + name.cyan);

  return prompt()
    .then(function (_useHtml) {
      directiveType = _useHtml ? 'element' : 'attribute';
      return init.load();
    })
    .then(function (_options) {
      options = _options;
      values.module = options.module;
      return fileHelper.getTemplates('directive', values);
    })
    .then(function (templates) {
      return templates.reduce(function (map, tmpl) {
        map[tmpl.name] = tmpl;
        return map;
      }, {});
    })
    .then(function (tmplMap) {
      var files = [];

      if(directiveType === 'element') {

        // code file
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(),
            options.sourceFolder,
            'directives',
            values.name,
            values.filename + '.js'),
          tmplMap['template-element.js'].content));

        // html file
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(),
            options.sourceFolder,
            'directives',
            values.name,
            values.filename + '.html'),
          tmplMap['template.html'].content));

        // css file
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(),
            options.sourceFolder,
            'directives',
            values.name,
            values.filename + '.' + options.cssPrecompiler),
          ''));

        // test file
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(),
            options.testFolder,
            'unit',
            'directives',
            values.filename + '.js'),
          tmplMap['test-element.js'].content));
      } else {
        // code file
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(),
            options.sourceFolder,
            'directives',
            values.filename + '.js'),
          tmplMap['template-attribute.js'].content));

        // test file
        files.push(fileHelper.saveFile(
          path.resolve(process.cwd(),
            options.testFolder,
            'unit',
            'directives',
            values.filename + '.js'),
          tmplMap['test-attribute.js'].content));
      }

      return q.all(files);
    })
    .then(function () {
      var codePath = (directiveType === 'element') ? 'directives/' + values.name : 'directives';
      return scriptHelper.insertScripts({
        name: values.filename,
        type: 'directive',
        codePath: codePath,
        testPath: 'directives'
      });
    })
    .then(function () {
      if('element' === directiveType) {
        return scriptHelper.insertImport(options.sourceFolder + '/directives/' + values.name + '/' + values.name + '/');
      } else {
        return;
      }
    });
};