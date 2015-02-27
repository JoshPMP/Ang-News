var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonPromise = require('sinon-promise'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));
sinonPromise(sinon);

describe('/init', function () {
  var init, fs, inquirer, file;

  beforeEach(function () {
    file = process.cwd() + '/.generatorrc';
    inquirer = {
      prompt: sinon.stub()
    };
    fs = {
      statSync: sinon.stub(),
      readFile: sinon.stub(),
      writeFile: sinon.stub()
    };
    init = proxyquire(process.cwd() + '/lib/init', {
      'inquirer': inquirer,
      'fs': fs,
      'q': sinonPromise.Q
    });
  });

  describe('#isInitialized', function () {
    it('checks if file exists', function () {
      init.isInitialized();
      expect(fs.statSync).calledOnce.calledWith(file);
    });
    it('returns true if /.generatorrc exists', function () {
      fs.statSync.returns({});
      expect(init.isInitialized()).to.be.true;
    });
    it('returns false if /.generatorrc doesn\'t exist', function () {
      fs.statSync.throws();
      expect(init.isInitialized()).to.be.false;
    });
  });
  describe('#load', function () {
    it('loads /.generatorrc if it exists', function () {
      var options = { foo: 'bar' };
      fs.readFile.yields(null, JSON.stringify(options));

      var success = sinon.spy();
      var fail = sinon.spy();
      init.load().then(success).catch(fail);

      expect(fail, 'fail').not.called;
      expect(success, 'success').calledOnce.calledWith(options);

      expect(fs.readFile).calledOnce;
      expect(fs.readFile).calledWith(process.cwd() + '/.generatorrc', {encoding:'utf8'});
    });
    it('returns options from memory if already read', function () {
      var options = { foo: 'bar' };
      fs.readFile.yields(null, JSON.stringify(options));

      var success = sinon.spy();
      var fail = sinon.spy();
      init.load().then(success).catch(fail);
      init.load().then(success).catch(fail);

      expect(fail, 'fail').not.called;
      expect(success, 'success').calledTwice;

      expect(fs.readFile).calledOnce;
    });
    it('returns empty options if /.generatorrc does not exist', function () {
      fs.readFile.yields(new Error());

      var success = sinon.spy();
      var fail = sinon.spy();
      init.load().then(success).catch(fail);

      expect(fail, 'fail').not.called;
      expect(success, 'success').calledOnce.calledWith({});

      expect(fs.readFile).calledOnce;
    });
  });
  describe('#prompt', function () {
    it('inquirer.prompt gets called with the correct questions and defaults', function () {
      var options = {
        module: 'myModule',
        sourceFolder: '/foo',
        testFolder: '/test',
        templatesFolder: '/bar',
        buildFolder: '/herp',
        cssPrecompiler: '/derp'
      };
      init.prompt(options);
      expect(inquirer.prompt).calledOnce;
      var questions = inquirer.prompt.firstCall.args[0];

      expect(questions).to.have.length(6);

      expect(questions[0].type).to.equal('input');
      expect(questions[0].name).to.equal('module');
      expect(questions[0].default).to.equal(options.module);

      expect(questions[1].type).to.equal('input');
      expect(questions[1].name).to.equal('sourceFolder');
      expect(questions[1].default).to.equal(options.sourceFolder);

      expect(questions[2].type).to.equal('input');
      expect(questions[2].name).to.equal('testFolder');
      expect(questions[2].default).to.equal(options.testFolder);

      expect(questions[3].type).to.equal('input');
      expect(questions[3].name).to.equal('templatesFolder');
      expect(questions[3].default).to.equal(options.templatesFolder);

      expect(questions[4].type).to.equal('input');
      expect(questions[4].name).to.equal('buildFolder');
      expect(questions[4].default).to.equal(options.buildFolder);

      expect(questions[5].type).to.equal('list');
      expect(questions[5].name).to.equal('cssPrecompiler');
      expect(questions[5].choices).to.eql(['less', 'sass', 'stylus', 'plain css']);
      expect(questions[5].default).to.equal(options.cssPrecompiler);
    });
    it('resolver the given answers', function () {
      var success = sinon.spy();
      var answers = {
        module: 'myModule',
        sourceFolder: '/foo',
        templatesFolder: '/bar',
        buildFolder: '/herp',
        cssPrecompiler: '/derp'
      };
      inquirer.prompt.yields(answers);
      init.prompt({}).then(success);
      expect(success).calledOnce.calledWith(answers);
    });
  });
  describe('#save', function () {
    it('saves the given options to disk', function () {
      var options = { foo: 'bar' };
      init.save(options);
      expect(fs.writeFile, 'fs.writeFile').calledOnce.calledWith(file);
    });
  });
  describe('#initialize', function () {
    it('calls load, prompt and then save', function () {
      var success = sinon.spy();
      var fail = sinon.spy();

      init.initialize().then(success).catch(fail);
      
      expect(fs.readFile, 'fs.readFile').calledOnce;
      fs.readFile.yield(null, '{}');

      expect(inquirer.prompt, 'inquirer.prompt').calledOnce;
      inquirer.prompt.yield({});

      expect(fs.writeFile, 'fs.writeFile').calledOnce;
      fs.writeFile.yield(null, {});

      expect(fail).not.called;
      expect(success).calledOnce;
    });
  });
});