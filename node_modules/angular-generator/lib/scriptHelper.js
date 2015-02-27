var fs = require('fs'),
  path = require('path'),
  q = require('q'),
  colors = require('colors'),
  ejs = require('ejs'),
  init = require('./init'),
  fileHelper = require('./fileHelper'),
  log = require('./log');

function createScriptTag(pagePath, scriptPath) {
  var src = path.relative(path.dirname(pagePath), scriptPath);
  return '<script src="' + src + '"></script>';
}

function insertIn(html, script, part) {
  var rx = new RegExp('([ \t]*)<!-- \/'+part+'s -->');
  var matches = html.match(rx);
  return html.replace(matches[0], matches[1] + script + '\n' + matches[0]);
}

function getResource(src, tmplSrc, replaceOptions) {
  return q.nfcall(fs.readFile, src, {encoding:'utf8'})
    .catch(function () {
      var file, promise;
      if(tmplSrc) {
        promise = q.nfcall(fs.readFile, tmplSrc, {encoding:'utf8'});
      } else {
        promise = q('');
      }
      return promise
        .then(function (_file) {
          file = (replaceOptions) ? ejs.render(_file, replaceOptions) : _file;
          return fileHelper.saveFile(src, file, true);
        })
        .then(function () {
          return file;
        });
    });
}

function insertScripts(scripts) {

  var appHtmlPath, testHtmlPath, options;

  return init.load()
    .then(function (_options) {
      options = _options;
      appHtmlPath = path.resolve(process.cwd(), options.sourceFolder, 'index.html');
      testHtmlPath = path.resolve(process.cwd(), options.testFolder, 'unit', 'index.html');

      return q.all([
        getResource(appHtmlPath, path.resolve(__dirname, '../templates/app.html'), options),
        getResource(testHtmlPath, path.resolve(__dirname, '../templates/test.html'), options)
      ]);
    })
    .then(function (htmls) {
      var appHtml = htmls[0];
      var testHtml = htmls[1];

      var codePath = path.resolve(options.sourceFolder, scripts.codePath, scripts.name + '.js');
      var testPath = path.resolve(options.testFolder, 'unit', scripts.testPath, scripts.name + '.js');

      try {
        appHtml = insertIn(appHtml, createScriptTag(appHtmlPath, codePath), scripts.type);
        log.info('Inserted ' + scripts.name.cyan + ' in app HTML');
      } catch(err) {
        log.warn('Could not find insertion point for ' +
          scripts.type.yellow +
          ' script ' +
          scripts.name.yellow +
          ' in app HTML file.');
      }

      try {
        testHtml = insertIn(testHtml, createScriptTag(testHtmlPath, codePath), scripts.type);
        log.info('Inserted ' + scripts.name.cyan + ' in test HTML');
      } catch(err) {
        log.warn('Could not find insertion point for ' +
          scripts.type.yellow +
          ' script ' +
          scripts.name.yellow +
          ' in test HTML file.');
      }

      try {
        testHtml = insertIn(testHtml, createScriptTag(testHtmlPath, testPath), scripts.type + ' test');
        log.info('Inserted ' + (scripts.name + ' test').cyan + ' in test HTML');
      } catch(err) {
        log.warn('Could not find insertion point for ' +
          (scripts.type + ' test').yellow +
          ' script ' +
          scripts.name.yellow +
          ' in test HTML file.');
      }

      return q.all([
        fileHelper.saveFile(appHtmlPath, appHtml, true),
        fileHelper.saveFile(testHtmlPath, testHtml, true)
      ]);
    });
}

function insertImport(importPath) {
  var options, mainStylePath;
  var rxImports = /^(\@import ["'][\w-_.\/]*["'];?\n)*/;

  return init.load()
    .then(function (_options) {
      options = _options;
      mainStylePath = path.resolve(process.cwd(), options.sourceFolder, 'css', 'main.' + options.cssPrecompiler);
      importPath = path.relative(path.dirname(mainStylePath), importPath);
      return getResource(mainStylePath);
    })
    .then(function (resource) {
      var imp;
      switch(options.cssPrecompiler) {
        case 'less':
        case 'sass':
          imp = '@import "' + importPath + '";\n';
          break;
        case 'stylus':
          imp = '@import \'' + importPath + '\'\n';
          break;
        default:
          return;
      }
      var matches = resource.match(rxImports);
      if(matches) {
        resource = resource.replace(matches[0], matches[0] + imp);
      } else {
        resource = imp + resource;
      }

      return fileHelper.saveFile(mainStylePath, resource, true);
    });
}

module.exports = {
  createScriptTag: createScriptTag,
  insertScripts: insertScripts,
  insertImport: insertImport,
  insertIn: insertIn,
  getResource: getResource
};