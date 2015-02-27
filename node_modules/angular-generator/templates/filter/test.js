describe('/filters/<%= name %>', function () {

  var filter;

  beforeEach(function () {
    module('<%= module %>');
    inject(function ($filter) {
      filter = $filter('<%= name %>');
    });
  });

  xit('should have tests', function () {
    expect(filter('input')).to.equal('filter result');
  });

});