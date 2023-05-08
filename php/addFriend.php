<?php

require_once "functions.php";

// Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["PATCH"];
checkMethod($requestMethod, $allowed);

$filename = __DIR__."users.json";
$users = [];

// Check if file exists. If it doesn't, send error message. If it exists get contents from $filename then decode and save it in $users.
if(!file_exists($filename)){
    $message = ["message" => "Something went wrong. Please try again later."];
    sendJSON($message, 400);
}

$json = file_get_contents($filename);
$users = json_decode($json, true);    

// Get contents from the request and save them in their respective variable.
$requestJSON = file_get_contents("php://input");
$requestData = json_decode($requestJSON, true);

$userFrom = $requestData["userFrom"];
$userTo = $requestData["userTo"];
$action = $requestData["action"];

if($action == "sendRequest"){
    //Find requested user and add the id of the requester to friendRequests 
    foreach($users as $index => $user){
        if($user["username"] === $userTo){
            $users[$index]["friendRequests"][] = $userFrom;

            $json = json_encode($users, JSON_PRETTY_PRINT);
            file_put_contents($filename, $json);
            $message = ["message" => "Friend request sent", "action" => "sendRequest"];
            sendJSON($message);
        }
    }
}

if($action == "acceptRequest") {

    foreach($users as $index => $user){
        if($user["id"] === $userTo){
            $users[$index]["friends"][] = $userFrom;

            $friendRequests = $users[$index]["friendRequests"];

            foreach($friendRequests as $requestIndex => $request){
                if($request == $userFrom){
                    array_splice($users[$index]["friendRequests"], $requestIndex, 1);

                    $json = json_encode($users, JSON_PRETTY_PRINT);
                    file_put_contents($filename, $json);
        
                    $message = ["message" => "Friend request accepted", "action" => "acceptRequest"];
                    sendJSON($message);
                }
            }
        }
    }
    
}

if($action == "declineRequest") {
    foreach($users as $index => $user){
        if($user["id"] === $userTo){

            $friendRequests = $users[$index]["friendRequests"];

            foreach($friendRequests as $requestIndex => $request){
                if($request == $userFrom){
                    array_splice($users[$index]["friendRequests"], $requestIndex, 1);

                    $json = json_encode($users, JSON_PRETTY_PRINT);
                    file_put_contents($filename, $json);
        
                    $message = ["message" => "Friend request declined", "action" => "declineRequest"];
                    sendJSON($message);
                }
            }
        }
    }
}

$message = ["message" => "User not found"];
sendJSON($message, 404);
?>