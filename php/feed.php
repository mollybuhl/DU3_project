<?php

require_once "functions.php";

// Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["GET"];
checkMethod($requestMethod, $allowed);

$filename = "php/users.json";
$users = [];

// Check if file exists. If it doesn't, send error message. If it exists get contents from $filename then decode and save it in $users.
if(!file_exists($filename)){
    $message = ["message" => "Something went wrong. Please try again later."];
    sendJSON($message, 400);
}else{
    $json = file_get_contents($filename);
    $users = json_decode($json, true);

    $usersLimitedAcces = [];

    foreach($users as $user){
        $usersLimitedAcces[] = ["id" => $user["id"], "username" => $user["username"], "friends" => $user["friends"], "posts" => $user["posts"], "profilePicture" => $user["profilePicture"]];
    }

    sendJSON($usersLimitedAcces);
    
}


?>