<?php
ini_set("display_errors", 1); 
require_once "functions.php";

function feed($requestData, $users){

    // Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["GET", "DELETE"];
    checkMethod($requestMethod, $allowed);
    

    if($requestMethod == "GET"){
        $usersLimitedAcces = [];
        foreach($users as $user){
            $usersLimitedAcces[] = ["id" => $user["id"], "username" => $user["username"], "friends" => $user["friends"], "friendRequests" => $user["friendRequests"], "posts" => $user["posts"], "profilePicture" => $user["profilePicture"]];
        }
        
        sendJSON($usersLimitedAcces);
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
                        array_splice($users[$indexUser]["posts"], $indexPost, 1);
                       
                        putInUsersJSON($users);
                        $message = ["message" => "Post Deleted"];
                        sendJSON($message);
                    } 
                }
            }
        }
    }
}?>