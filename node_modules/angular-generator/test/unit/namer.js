var chai = require('chai'),
  expect = chai.expect,
  namer = require(process.cwd() + '/lib/namer');

describe('/namer', function () {
  describe('controller', function () {
    it('handles lc', function () {
      expect(namer.controller('foo')).to.equal('FooCtrl');
    });
    it('handles cc', function () {
      expect(namer.controller('myFoo')).to.equal('MyFooCtrl');
    });
    it('handles pc', function () {
      expect(namer.controller('MyFoo')).to.equal('MyFooCtrl');
    });
    it('handles sc', function () {
      expect(namer.controller('my_foo')).to.equal('MyFooCtrl');
    });
    it('handles names with Ctrl', function () {
      expect(namer.controller('my_foo_ctrl')).to.equal('MyFooCtrl');
    });
    it('handles names with Controller', function () {
      expect(namer.controller('my_foo_controller')).to.equal('MyFooCtrl');
    });
  });
  describe('directive', function () {
    it('handles lc', function () {
      expect(namer.directive('foo')).to.equal('foo');
    });
    it('handles cc', function () {
      expect(namer.directive('myFoo')).to.equal('myFoo');
    });
    it('handles pc', function () {
      expect(namer.directive('MyFoo')).to.equal('myFoo');
    });
    it('handles sc', function () {
      expect(namer.directive('my_foo')).to.equal('myFoo');
    });
  });
  describe('filter', function () {
    it('handles lc', function () {
      expect(namer.filter('foo')).to.equal('foo');
    });
    it('handles cc', function () {
      expect(namer.filter('myFoo')).to.equal('myFoo');
    });
    it('handles pc', function () {
      expect(namer.filter('MyFoo')).to.equal('myFoo');
    });
    it('handles sc', function () {
      expect(namer.filter('my_foo')).to.equal('myFoo');
    });
  });
  describe('model', function () {
    it('handles lc', function () {
      expect(namer.model('foo')).to.equal('Foo');
    });
    it('handles cc', function () {
      expect(namer.model('myFoo')).to.equal('MyFoo');
    });
    it('handles pc', function () {
      expect(namer.model('MyFoo')).to.equal('MyFoo');
    });
    it('handles sc', function () {
      expect(namer.model('my_foo')).to.equal('MyFoo');
    });
  });
  describe('service', function () {
    it('handles lc', function () {
      expect(namer.service('foo')).to.equal('foo');
    });
    it('handles cc', function () {
      expect(namer.service('myFoo')).to.equal('myFoo');
    });
    it('handles pc', function () {
      expect(namer.service('MyFoo')).to.equal('myFoo');
    });
    it('handles sc', function () {
      expect(namer.service('my_foo')).to.equal('myFoo');
    });
  });
  describe('file', function () {
    it('handles lc', function () {
      expect(namer.file('foo')).to.equal('foo');
    });
    it('handles cc', function () {
      expect(namer.file('myFoo')).to.equal('myFoo');
    });
    it('handles pc', function () {
      expect(namer.file('MyFoo')).to.equal('myFoo');
    });
    it('handles sc', function () {
      expect(namer.file('my_foo')).to.equal('myFoo');
    });
  });
});