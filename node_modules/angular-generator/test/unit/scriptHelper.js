var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/scriptHelper', function () {
  var scriptHelper, fs, fileHelper, init, options, log;

  beforeEach(function () {
    options = {
      module: 'generator',
      sourceFolder: 'src',
      testFolder: 'test'
    };
    init = {
      load: sinon.promise().resolves(options)
    };
    log = {
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub()
    };
    fs = {
      readFile: sinon.stub()
    };
    fileHelper = {
      saveFile: sinon.promise()
    };
    scriptHelper = proxyquire(process.cwd() + '/lib/scriptHelper', {
      'fs': fs,
      'q': sinonPromise.Q,
      './init': init,
      './fileHelper': fileHelper,
      './log': log
    });
  });

  describe('#getResource', function () {
    it('creates an empty file if no template src is passed in', function () {
      fs.readFile.yields('ENOENT');
      scriptHelper.getResource('/foo/bar/baz.less');
      expect(fileHelper.saveFile).calledOnce.calledWith('/foo/bar/baz.less', '', true);
    });
  });

  describe('#createScriptTag', function () {
    it('calculates the path and creates a tag', function () {
      var pagePath = './foo/index.html';
      var scriptPath = './bar/index.js';
      var tag = scriptHelper.createScriptTag(pagePath, scriptPath);
      expect(tag).to.equal('<script src="../bar/index.js"></script>');
    });
  });

  describe('#insertIn', function () {
    it('inserts text above delimiter', function () {
      var tmpl = [
        '<!-- services -->',
        '<!-- /services -->'
      ].join('\n');
      var script = '<script src="services/foo.js"></script>';
      var expected = [
        '<!-- services -->',
        '<script src="services/foo.js"></script>',
        '<!-- /services -->'
      ].join('\n');
      var result = scriptHelper.insertIn(tmpl, script, 'service');
      expect(result).to.equal(expected);
    });
  });

  describe('#insertScripts', function () {
    it('tries to load app and test .html', function () {
      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));
      expect(fs.readFile).calledTwice;
      expect(fs.readFile).calledWith(process.cwd() + '/src/index.html', {encoding:'utf8'});
      expect(fs.readFile).calledWith(process.cwd() + '/test/unit/index.html', {encoding:'utf8'});
    });
    it('loads default app html if it does not exist', function () {
      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));

      fs.readFile.firstCall.yield('ENOENT');
      fs.readFile.secondCall.yield(null, '<html />');

      expect(fs.readFile).calledThrice.calledWith(process.cwd() + '/templates/app.html');
    });
    it('creates app html if it does not exist', function () {
      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));

      fs.readFile.firstCall.yield('ENOENT');
      fs.readFile.secondCall.yield(null, '<html />');

      fs.readFile.thirdCall.yield(null, '<html ngApp="<%= module %>" />');

      expect(fileHelper.saveFile).calledOnce.calledWith(process.cwd() + '/src/index.html', '<html ngApp="generator" />', true);
    });
    it('loads default test html if it does not exist', function () {
      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));

      fs.readFile.firstCall.yield(null, '<html />');
      fs.readFile.secondCall.yield('ENOENT');

      expect(fs.readFile).calledThrice.calledWith(process.cwd() + '/templates/test.html');
    });
    it('creates test html if it does not exist', function () {
      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));

      fs.readFile.firstCall.yield(null, '<html />');
      fs.readFile.secondCall.yield('ENOENT');

      fs.readFile.thirdCall.yield(null, '<html ngApp="<%= module %>" />');

      expect(fileHelper.saveFile).calledOnce.calledWith(process.cwd() + '/test/unit/index.html', '<html ngApp="generator" />', true);
    });
    it('inserts a script tag in .html and saves it', function () {
      var tmpl = [
        '<html>',
        '  <body>',
        '    <!-- services -->',
        '    <!-- /services -->',
        '',
        '    <!-- service tests -->',
        '    <!-- /service tests -->',
        '  </body>',
        '</html>'
      ].join('\n');
      var expectedApp = [
        '<html>',
        '  <body>',
        '    <!-- services -->',
        '    <script src="services/foo.js"></script>',
        '    <!-- /services -->',
        '',
        '    <!-- service tests -->',
        '    <!-- /service tests -->',
        '  </body>',
        '</html>'
      ].join('\n');
      var expectedTest = [
        '<html>',
        '  <body>',
        '    <!-- services -->',
        '    <script src="../../src/services/foo.js"></script>',
        '    <!-- /services -->',
        '',
        '    <!-- service tests -->',
        '    <script src="services/foo.js"></script>',
        '    <!-- /service tests -->',
        '  </body>',
        '</html>'
      ].join('\n');

      fs.readFile.yields(null, tmpl);

      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));

      expect(fileHelper.saveFile).calledTwice;
      expect(fileHelper.saveFile).calledWith(process.cwd() + '/src/index.html', expectedApp, true);
      expect(fileHelper.saveFile).calledWith(process.cwd() + '/test/unit/index.html', expectedTest, true);
    });
    it('warns if insert point can\'t be found', function () {
      var tmpl = [
        '<html>',
        '  <body>',
        '  </body>',
        '</html>'
      ].join('\n');

      fs.readFile.yields(null, tmpl);

      scriptHelper.insertScripts({
        name: 'foo',
        codePath: 'services',
        testPath: 'services',
        type: 'service'
      }).catch(console.error.bind(console));

      expect(fileHelper.saveFile).calledTwice;
      expect(fileHelper.saveFile).calledWith(process.cwd() + '/src/index.html', tmpl, true);
      expect(fileHelper.saveFile).calledWith(process.cwd() + '/test/unit/index.html', tmpl, true);

      expect(log.warn).calledThrice;
    });
  });
  describe('#insertImport', function () {
    it('creates style doc if it doesn\'t exist', function () {
      fs.readFile.yields('ENOENT');
      scriptHelper.insertImport('src/partials/foo/foo.less').catch(console.error.bind(console));
      expect(fileHelper.saveFile).calledOnce;
    });
    it('inserts import at correct place', function () {
      options.cssPrecompiler = 'stylus';
      fs.readFile.yields(null, '@import \'../partials/bar/bar\'\n');

      scriptHelper.insertImport('src/partials/foo/foo').catch(console.error.bind(console));

      expect(fileHelper.saveFile.firstCall.args[1]).to.equal('@import \'../partials/bar/bar\'\n@import \'../partials/foo/foo\'\n');
    });
    it('inserts import correctly for less', function () {
      options.cssPrecompiler = 'less';
      fs.readFile.yields(null, '');
      scriptHelper.insertImport('src/partials/foo/foo').catch(console.error.bind(console));
      expect(fileHelper.saveFile.firstCall.args[0]).to.match(/.less$/);
      expect(fileHelper.saveFile.firstCall.args[1]).to.equal('@import "../partials/foo/foo";\n');
    });
    it('inserts import correctly for sass', function () {
      options.cssPrecompiler = 'sass';
      fs.readFile.yields(null, '');
      scriptHelper.insertImport('src/partials/foo/foo').catch(console.error.bind(console));
      expect(fileHelper.saveFile.firstCall.args[0]).to.match(/.sass$/);
      expect(fileHelper.saveFile.firstCall.args[1]).to.equal('@import "../partials/foo/foo";\n');
    });
    it('inserts import correctly for stylus', function () {
      options.cssPrecompiler = 'stylus';
      fs.readFile.yields(null, '');
      scriptHelper.insertImport('src/partials/foo/foo').catch(console.error.bind(console));
      expect(fileHelper.saveFile.firstCall.args[0]).to.match(/.stylus$/);
      expect(fileHelper.saveFile.firstCall.args[1]).to.equal('@import \'../partials/foo/foo\'\n');
    });
    it('does not insert import for css', function () {
      options.cssPrecompiler = 'css';
      fs.readFile.yields('ENOENT');
      scriptHelper.insertImport('src/partials/foo/foo').catch(console.error.bind(console));
      expect(fileHelper.saveFile).calledOnce;
      expect(fileHelper.saveFile.firstCall.args[0]).to.match(/.css$/);
      expect(fileHelper.saveFile.firstCall.args[1]).to.equal('');
    });
  });
});