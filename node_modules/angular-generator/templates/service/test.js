describe('/services/<%= name %>', function () {

  var <%= name %>;

  beforeEach(function () {
    module('<%= module %>');
    inject(function (_<%= name %>_) {
      <%= name %> = _<%= name %>_;
    });
  });

  xit('should have tests', function () {
    //expect(<%= name %>.doSomething()).to.equal('something');
  });

});