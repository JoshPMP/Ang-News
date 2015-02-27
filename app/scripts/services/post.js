'use strict';

app.factory('Post', function($firebase, FIREBASE_URL){
	var ref = new Firebase(FIREBASE_URL);  //set ref to the firebase database url
	var posts = $firebase(ref.child('posts')).$asArray();//set post var to out posts section in Firebase, store it as an array
   
    var Post = {
    	all: posts,
    	create: function (post) {
    		return posts.$add(post).then(function(postRef){
                $firebase(ref.child('user_posts').child(post.creatorUID)).$push(postRef.name()); //add user profile info to post
            }); //add the post to this
    	},
    	get: function (postId) {
    		return $firebase(ref.child('posts').child(postId)).$asObject(); //pull this post from our 'posts' section with this postId, as an object
    	},
    	delete: function (post) {
    		return posts.$remove(post);  //$scope.post = {url: 'http://', title: ''};  
    	}
    };
    return Post; //return the new post
});


