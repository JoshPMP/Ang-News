angular.module('<%= module %>').directive('<%= name %>', function () {
  'use strict';

  return {
    restrict: 'E',
    replace: true,
    scope: {

    },
    templateUrl: 'directives/<%= name %>/<%= name %>.html',
    link: function (scope, element, attrs, fn) {


    }
  };
});