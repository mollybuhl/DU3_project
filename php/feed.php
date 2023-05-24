<?php

function feed($requestData, $users){
    require_once "functions.php";

    // Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["GET", "DELETE"];
    checkMethod($requestMethod, $allowed);
    

    if($requestMethod == "GET"){

        if(!isset($requestData["feedAction"])){
            $message = ["message" => "No feedAction was provided"];
            sendJSON($message, 400);
        };

        $loggedInUserID = $requestData["userID"];
        $loggedInUser;
        $loggedInUserLimitedAcces;

        foreach($users as $user){
            if($user["id"] == $loggedInUserID){
                $loggedInUser = $user;
                $loggedInUserLimitedAcces = ["id" => $user["id"], "username" => $user["username"], "friends" => $user["friends"], "friendRequests" => $user["friendRequests"], "posts" => $user["posts"], "profilePicture" => $user["profilePicture"]];
            }
        }
        

        if($requestData["feedAction"] == "getUserInfo"){
    
            $loggedInUserFriends = $loggedInUser["friends"];
            $loggedInUserFriendsLimitedAcces = []; 
            foreach($users as $userIndex => $user){
                if(in_array($user["id"], $loggedInUserFriends)){
                    $loggedInUserFriendsLimitedAcces[] = ["id" => $user["id"], "username" => $user["username"], "friends" => $user["friends"], "friendRequests" => $user["friendRequests"], "posts" => $user["posts"], "profilePicture" => $user["profilePicture"]];
                }
            }    
            
            $usersLimitedAcces = ["user" => $loggedInUserLimitedAcces, "userFriends" => $loggedInUserFriendsLimitedAcces];
            sendJSON($usersLimitedAcces);
        }

        if($requestData["feedAction"] == "getFriendRequestInfo"){
            $friendRequests = $loggedInUser["friendRequests"];
            $friendRequestsUsersLimitedAcces = [];

            foreach($friendRequests as $request){
                foreach($users as $user){
                    if($user["id"] == $request){
                        $friendRequestsUsersLimitedAcces[] = ["id" => $user["id"], "username" => $user["username"], "profilePicture" => $user["profilePicture"]];
                    }
                }
            }
            sendJSON($friendRequestsUsersLimitedAcces);
        }

        if($requestData["feedAction"] == "searchUser"){

            if(!isset($requestData["searchInput"])){
                $message = ["message" => "No searchInput was provided, try again later"];
                sendJSON($message, 400);
            };
            
            $searchInput = $requestData["searchInput"];

            foreach($users as $index => $user){
                if($user["username"] == $searchInput){

                    if(in_array($user["id"], $loggedInUser["friends"])){
                        $username = $user["username"];
                        $message = ["message" => "You are already friends with $username"];
                        sendJSON($message, 400);
                    }else{
                        $searchUserLimitedAcces = ["id" => $user["id"], "username" => $user["username"]];
                        sendJSON($searchUserLimitedAcces);
                    }

                }
            }

            $message = ["message" => "No user with the name $searchInput was found"];
            sendJSON($message, 404);
        }
        
    }
    
    
    if($requestMethod == "DELETE"){
        if(!isset($requestData["actionCredentials"]["postID"])){
            $message = ["message" => "No post id."];
            sendJSON($message, 400); 
        }
    
        $userID = $requestData["userID"];
        $postID = $requestData["actionCredentials"]["postID"];
    
        foreach($users as $indexUser => $user){
            if($user["id"] == $userID){

                $userPosts = $users[$indexUser]["posts"];
                foreach($userPosts as $indexPost => $userPost){
    
                    if($userPost["postID"] == $postID){
                        //Remove from users posts
                        array_splice($users[$indexUser]["posts"], $indexPost, 1);
                       
                        //Remove from users "loggedFeelings" 
                        $userLoggedFeelings = $user["loggedFeelings"];
                        foreach($userLoggedFeelings as $weekIndex => $weeklyLoggedFeelings){
                            foreach ($weeklyLoggedFeelings as $postKeyIndex => $post) {
                                if(is_array($post)){
                                    if($post["postId"] == $postID){
                                        unset($users[$indexUser]["loggedFeelings"][$weekIndex][$postKeyIndex]);
                                    }
                                }
                            }
                        }
                        putInUsersJSON($users);
                        $message = ["message" => "Post Deleted"];
                        sendJSON($message);
                    } 
                }
                $message = ["message" => "This post was not found."];
                sendJSON($message, 400); 
            }
        }
    }
}?>