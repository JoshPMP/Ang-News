describe('/controllers/<%= name %>', function () {

  var scope, ctrl;

  beforeEach(function () {
    module('<%= module %>');
    inject(function ($rootScope, $controller) {
      scope = $rootScope.$new();
      ctrl = $controller('<%= name %>', {$scope: scope});
    });
  });

  xit('should have tests', function () {
    
  });

});