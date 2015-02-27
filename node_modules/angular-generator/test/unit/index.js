var chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  proxyquire = require('proxyquire');

chai.use(require('sinon-chai'));

describe('/index', function () {
  var generator;
  var gulp, program;
  var init, generators;

  beforeEach(function () {
    gulp = {
      task: sinon.stub()
    };

    program = {
      version: sinon.stub(),
      usage: sinon.stub(),
      option: sinon.stub(),
      parse: sinon.stub()
    };
    program.version.returns(program);
    program.usage.returns(program);
    program.option.returns(program);

    init = {
      isInitialized: sinon.stub().returns(true),
      initialize: sinon.stub()
    };

    generators = {
      partial: sinon.stub(),
      controller: sinon.stub(),
      service: sinon.stub(),
      directive: sinon.stub(),
      filter: sinon.stub(),
      model: sinon.stub(),
      constant: sinon.stub()
    };

    generator = proxyquire(process.cwd() + '/lib/', {
      'gulp': gulp,
      'commander': program,
      './init': init,
      './generators/partial': generators.partial,
      './generators/controller': generators.controller,
      './generators/service': generators.service,
      './generators/directive': generators.directive,
      './generators/filter': generators.filter,
      './generators/model': generators.model,
      './generators/constant': generators.constant,
    });

    sinon.stub(process, 'nextTick').yields();
  });
  afterEach(function () {
    process.nextTick.restore();
  });

  it('calls all succesful commands in series', function () {
    init.initialize.returns();
    generators.partial.returns();

    program.init = null;
    program.partial = 'foo';

    var success = sinon.spy();
    var fail = sinon.spy();
    generator.generate().then(success).catch(fail);

    expect(init.initialize).calledOnce;
    expect(generators.partial).calledOnce;

    expect(fail, 'fail').not.called;
    expect(success, 'success').calledOnce.calledWith(undefined);
  });

  it('halts execution of series on fail', function () {
    var err = new Error('b0rked');
    init.initialize.throws(err);
    generators.partial.returns();

    program.init = null;
    program.partial = 'foo';

    var success = sinon.spy();
    var fail = sinon.spy();
    generator.generate().then(success).catch(fail);

    expect(init.initialize).calledOnce;
    expect(generators.partial).not.called;
  });
});