'use strict'

//creating a controller with the name NavCtrl and creating a function that contains the scope, location, and post
app.controller('NavCtrl', function($scope, $location, Post, Auth) {
    //telling the post to start the website with a url
    $scope.post = {url: '', title: ''};
    //
    $scope.user = Auth.user;
    
    //creating a function with the name submitPost
    $scope.submitPost = function()  {
        $scope.post.creator = $scope.user.profile.username;
        $scope.post.creatorUID = $scope.user.uid;
        //creating a post through the scope and then creating a promise
    Post.create($scope.post).then(function(ref) {
        //setting up the location of where the path should go bas
        $location.path('/posts/' + ref.name());
        //reset back to default
        $scope.post = {url: '', title: ''};
        });
    };

    $scope.signedIn = Auth.signedIn;
    $scope.logout = Auth.logout;
    
});