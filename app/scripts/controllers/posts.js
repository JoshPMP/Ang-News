
'use strict';

//creating a Posts controller and using the $scope and post to call 
app.controller('PostsCtrl', function ($scope, $location, Post) {
  $scope.posts = Post.all;

 $scope.post = {url: 'http://', title: ''};
//scope delete and deleting the post
  $scope.deletePost = function (post) {
    Post.delete(post);
  };

});