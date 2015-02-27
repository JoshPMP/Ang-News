'use strict';

app.controller('AuthCtrl', ['$scope', '$location', 'Auth', 'user', '$firebase', function($scope, $location, $firebase, Auth, user){
	if (user) {
		$location.path('/');  		//If the user exists, send them to the home page
	}



	  $scope.login = function () {
	    Auth.login($scope.user).then(function () {
	      $location.path('/');
	    }, function (error) {
	      $scope.error = error.toString();
	    });
	  };

	    $scope.register = function () {
		    Auth.register($scope.user).then(function() {         
		      return Auth.login($scope.user).then(function() {   
		        $location.path('/');							 
		      });
		    }, function(error) {					
		      $scope.error = error.toString();					
		    });
		  };


}]);


