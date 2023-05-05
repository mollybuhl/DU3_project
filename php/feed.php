<?php
ini_set("display_errors", 1); 

require_once "functions.php";

// Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["GET", "DELETE"];
checkMethod($requestMethod, $allowed);

$requestJSON = file_get_contents("php://input");
$requestData = json_decode($requestJSON, true);

$filename = "users.json";
$users = [];

// Check if file exists. If it doesn't, send error message. If it exists get contents from $filename then decode and save it in $users.
if(!file_exists($filename)){
    $message = ["message" => "Something went wrong. Please try again later."];
    sendJSON($message, 400);
}

$json = file_get_contents($filename);
$users = json_decode($json, true);

if($requestMethod == "GET"){
    $usersLimitedAcces = [];

    foreach($users as $user){
        $usersLimitedAcces[] = ["id" => $user["id"], "username" => $user["username"], "friends" => $user["friends"], "posts" => $user["posts"], "profilePicture" => $user["profilePicture"]];
    }
    
    sendJSON($usersLimitedAcces);
}

if($requestMethod == "DELETE"){
    if(!isset($requestData["podtID"]) || !isset($requestData["userID"])){
        $message = ["message" => "No post or user id."];
        sendJSON($message, 404); 
    }

    $userID = $requestData["userID"];
    $postID = $requestData["postID"];

    foreach($users as $index => $user){
        if($user["id"] == $userID){
            echo $user;

            $userPosts = $user["posts"];
            foreach($userPosts as $index => $userPost){

                if($userPost["postID"] == $postID){
                    array_splice($userPost, $index, 1);
                    $json = json_encode($users, JSON_PRETTY_PRINT);
                    file_put_contents($filename, $json);
        
                    $message = ["message" => "Post Deleted"];
                    sendJSON($message);
                } 
            }
        }
    }
}


?>