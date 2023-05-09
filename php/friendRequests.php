<?php

require_once "functions.php";

function friendRequests($requestData){
    // Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["PATCH"];
    checkMethod($requestMethod, $allowed);

    //Use new function to fetch users
    $filename = __DIR__."users.json";
    $users = [];
    $json = file_get_contents($filename);
    $users = json_decode($json, true);    

    $userFrom = $requestData["actionsCredentials"]["requestFrom"];
    $userTo = $requestData["actionsCredentials"]["requestTo"];
    $action = $requestData["actionsCredentials"]["requestAction"];

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
}

?>