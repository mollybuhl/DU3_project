<?php

require_once "functions.php";

// Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["PATCH"];
checkMethod($requestMethod, $allowed);

$filename = "users.json";
$users = [];

// Check if file exists. If it doesn't, send error message. If it exists get contents from $filename then decode and save it in $users.
if(!file_exists($filename)){
    $message = ["message" => "Something went wrong. Please try again later."];
    sendJSON($message, 400);
}else{
    $json = file_get_contents($filename);
    $users = json_decode($json, true);    
}

// Get contents from the request and save them in their respective variable.
$requestJSON = file_get_contents("php://input");
$requestData = json_decode($requestJSON, true);

$userFrom = $requestData["userFrom"];
$userTo = $requestData["userTo"];

//Find requested user and add the id of the requester to friendRequests 
foreach($users as $index => $user){
    if($user["username"] === $userTo){
        $users[$index]["friendRequests"][] = $userFrom;

        $json = json_encode($users, JSON_PRETTY_PRINT);
        file_put_contents($filename, $json);
        sendJSON($users[$index]["friendRequests"]);
    }
}
$message = ["message" => "User not found"];
sendJSON($message, 404);
?>