describe('/models/<%= name %>', function () {

  var <%= name %>;

  beforeEach(function () {
    module('<%= module %>');
    inject(function (_<%= name %>_) {
      <%= name %> = _<%= name %>_;
    });
  });

  it('can be instantiated', function () {
    expect(new <%= name %>()).to.be.instanceof(<%= name %>);
  });
  it('should have more tests');

});