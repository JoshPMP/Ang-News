'use strict';

app.controller('PostViewCtrl', function ($scope, $routeParams, Post) {
	$scope.post = Post.get($routeParams.postId);  //the post address is the current postId
});


