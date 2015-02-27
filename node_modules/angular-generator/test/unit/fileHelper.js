var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/fileHelper', function () {
  var fileHelper, fs, mkdirp, init, options, success, fail;

  beforeEach(function () {
    fs = {
      readdir: sinon.stub(),
      readFile: sinon.stub(),
      writeFile: sinon.stub(),
      stat: sinon.stub()
    };
    mkdirp = sinon.stub();
    options = {
      templatesFolder: 'custom'
    };
    init = {
      load: sinon.promise().resolves(options)
    };
    fileHelper = proxyquire(process.cwd() + '/lib/fileHelper', {
      'fs': fs,
      'mkdirp': mkdirp,
      'q': sinonPromise.Q,
      './init': init
    });
    success = sinon.spy();
    fail = sinon.spy();
  });

  describe('#listTemplates', function () {
    it('first gets the options from init', function () {
      fileHelper.listTemplates('service');
      expect(init.load).calledOnce;
    });
    it('starts by listing the the files of the default folder and then the customized', function () {
      fileHelper.listTemplates('service');
      fs.readdir.firstCall.yield(null, []);
      expect(fs.readdir).calledTwice;
      expect(fs.readdir, 'default').calledWith(process.cwd() + '/templates/service');
      expect(fs.readdir, 'custom').calledWith(process.cwd() + '/custom/service');
    });
    it('filters files prioritizing customized', function () {
      fileHelper.listTemplates('service').then(success).catch(fail);
      fs.readdir.firstCall.yield(null, ['foo.js', 'bar.js']);
      fs.readdir.secondCall.yield(null, ['bar.js', 'baz.js']);
      expect(fail).not.called;
      expect(success).calledOnce;
      var result = success.firstCall.args[0];
      expect(result).to.have.length(3);
    });
    it('works without customized folder', function () {
      fileHelper.listTemplates('service').then(success).catch(fail);
      fs.readdir.firstCall.yield(null, ['foo.js', 'bar.js']);
      fs.readdir.secondCall.yield('ENOENT');
      expect(fail).not.called;
      expect(success).calledOnce;
      var result = success.firstCall.args[0];
      expect(result).to.have.length(2);
    });
  });

  describe('#getTemplates', function () {
    it('loads all files from listTemplates', function () {
      fileHelper.getTemplates('service', {module: 'm', name: 'n'}).then(success).catch(fail);

      fs.readdir.firstCall.yield(null, ['foo.js', 'test.js']);
      fs.readdir.secondCall.yield(null, ['bar.js', 'test.js']);

      expect(fs.readFile).calledThrice;
      expect(fs.readFile).calledWith(process.cwd() + '/templates/service/foo.js', {encoding:'utf8'});
      expect(fs.readFile).calledWith(process.cwd() + '/custom/service/bar.js', {encoding:'utf8'});
      expect(fs.readFile).calledWith(process.cwd() + '/custom/service/test.js', {encoding:'utf8'});
    });
    it('adds file and rendered content to the templates', function () {
      fileHelper.getTemplates('service', {module: 'm', name: 'n'}).then(success).catch(fail);

      fs.readdir.firstCall.yield(null, ['foo.js', 'test.js']);
      fs.readdir.secondCall.yield(null, ['bar.js', 'test.js']);

      fs.readFile.firstCall.yield(null, '//<%= module %> <%= name %>');
      fs.readFile.secondCall.yield(null, '//bar');
      fs.readFile.thirdCall.yield(null, '//test');

      var expected = [
        {
          name: 'foo.js',
          path: process.cwd() + '/templates/service/foo.js',
          template: '//<%= module %> <%= name %>',
          content: '//m n'
        },
        {
          name: 'bar.js',
          path: process.cwd() + '/custom/service/bar.js',
          template: '//bar',
          content: '//bar'
        },
        {
          name: 'test.js',
          path: process.cwd() + '/custom/service/test.js',
          template: '//test',
          content: '//test'
        }
      ];

      expect(fail).not.call;
      expect(success).calledOnce.calledWith(expected);
    });
  });

  describe('#render', function () {
    it('replaces variables with passed in values', function () {
      var result = fileHelper.render('Hello you <%= foo %>, I <%= verb %> you!', {
        foo: 'herp',
        verb: 'derp'
      });
      expect(result).to.equal('Hello you herp, I derp you!');
    });
  });

  describe('#saveFile', function () {
    it('checks if directory exists', function () {
      fileHelper.saveFile('/foo/bar/baz/file.js', '');
      expect(fs.stat).calledOnce.calledWith('/foo/bar/baz');
    });
    it('creates the directory if it doesn\'t exist', function () {
      fs.stat.yields('ENOENT');
      fileHelper.saveFile('/foo/bar/baz/file.js', '');
      expect(mkdirp).calledOnce.calledWith('/foo/bar/baz');
    });
    it('checks if the file already exists', function () {
      fs.stat.withArgs('/foo/bar/baz').yields(null, {});
      fileHelper.saveFile('/foo/bar/baz/file.js', '');
      expect(fs.stat).calledTwice.calledWith('/foo/bar/baz/file.js');
    });
    it('throws if the file already exists', function () {
      fs.stat.withArgs('/foo/bar/baz').yields(null, {});
      fs.stat.withArgs('/foo/bar/baz/file.js').yields(null, {});
      fileHelper.saveFile('/foo/bar/baz/file.js', '').then(success).catch(fail);
      expect(success).not.called;
      expect(fail).calledOnce;
    });
    it('saves the file to existing dir', function () {
      fs.stat.withArgs('/foo/bar/baz').yields(null, {});
      fs.stat.withArgs('/foo/bar/baz/file.js').yields('ENOENT');
      fileHelper.saveFile('/foo/bar/baz/file.js', 'content');
      expect(fs.writeFile).calledOnce.calledWith('/foo/bar/baz/file.js', 'content');
    });
    it('saves the file to created dir', function () {
      fs.stat.yields('ENOENT');
      mkdirp.yields();
      fileHelper.saveFile('/foo/bar/baz/file.js', 'content');
      expect(fs.writeFile).calledOnce.calledWith('/foo/bar/baz/file.js', 'content');
    });
  });
});