<?php
ini_set("display_errors", 1); 
require_once "functions.php";

function feed($requestData){

    // Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["GET", "DELETE"];
    checkMethod($requestMethod, $allowed);
    
    //$requestJSON = file_get_contents("php://input");
    //$requestData = json_decode($requestJSON, true);
    
    $filename = __DIR__."/users.json";
    $users = [];
    
   
    
    $json = file_get_contents($filename);
    $users = json_decode($json, true);
    
    if($requestMethod == "GET"){
        $usersLimitedAcces = [];
    
        foreach($users as $user){
            $usersLimitedAcces[] = ["id" => $user["id"], "username" => $user["username"], "friends" => $user["friends"], "friendRequests" => $user["friendRequests"], "posts" => $user["posts"], "profilePicture" => $user["profilePicture"]];
        }
        
        sendJSON($usersLimitedAcces);
    }
    
    if($requestMethod == "DELETE"){
        if(!isset($requestData["postID"]) || !isset($requestData["userID"])){
            $message = ["message" => "No post or user id."];
            sendJSON($message, 404); 
        }
    
        $userID = $requestData["userID"];
        $postID = $requestData["postID"];
    
        foreach($users as $indexUser => $user){
            if($user["id"] == $userID){
    
                $userPosts = $users[$indexUser]["posts"];
    
                //$userPosts = $user["posts"];
                foreach($userPosts as $indexPost => $userPost){
    
                    if($userPost["postID"] == $postID){
                        array_splice($users[$indexUser]["posts"], $indexPost, 1);
                       
                        $json = json_encode($users, JSON_PRETTY_PRINT);
                        file_put_contents($filename, $json);
            
                        $message = ["message" => "Post Deleted"];
                        sendJSON($message);
                    } 
                }
            }
        }
    }
}



?>