var q = require('q'),
  fs = require('fs'),
  path = require('path'),
  mkdirp = require('mkdirp'),
  ejs = require('ejs'),
  init = require('./init'),
  log = require('./log');

function listTemplates(type) {
  var defaultFolder, customFolder;
  return init.load()
    .then(function (options) {
      defaultFolder = path.resolve(__dirname, '../templates/', type);
      customFolder = path.resolve(process.cwd(), options.templatesFolder, type);
      return q.all([
        q.nfcall(fs.readdir, defaultFolder),
        q.nfcall(fs.readdir, customFolder).catch(function () { return []; })
      ]);
    })
    .then(function (lists) {
      return lists[0]
        .filter(function (file) { return lists[1].indexOf(file) === -1; })
        .map(function (file) { return { name: file, path: defaultFolder + '/' + file }; })
        .concat(lists[1]
          .map(function (file) { return { name: file, path: customFolder + '/' + file }; }));
    });
}

function render(str, data) {
  return ejs.render(str, data);
}

function getTemplates(type, values) {
  return listTemplates(type)
    .then(function (templates) {
      return q.all(templates.map(function (template) {
        return q.nfcall(fs.readFile, template.path, {encoding:'utf8'})
          .then(function (tmpl) {
            template.template = tmpl;
            template.content = render(tmpl, values);
            return template;
          });
      }));
    });
}

function saveFile(filePath, content, overwrite) {
  var dir = path.dirname(filePath);
  return q.nfcall(fs.stat, dir)
    .catch(function () {
      // create dir
      return q.nfcall(mkdirp, dir);
    })
    .then(function () {
      // check if file exists
      var deferred = q.defer();
      if(overwrite) {
        deferred.resolve();
      } else {
        fs.stat(filePath, function (err) {
          if(err) { deferred.resolve(); }
          else { deferred.reject('File exists: ' + filePath); }
        });
      }
      return deferred.promise;
    })
    .then(function () {
      // save file
      return q.nfcall(fs.writeFile, filePath, content)
        .then(function () {
          log.info('Created file ' + filePath.cyan);
        });
    });
}

module.exports = {
  listTemplates: listTemplates,
  getTemplates: getTemplates,
  render: render,
  saveFile: saveFile
};