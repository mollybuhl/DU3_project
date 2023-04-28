<?php

require_once "functions.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["POST", "GET"];
checkMethod($requestMethod, $allowed);

if($requestMethod == "GET"){
    $filename = "php/users.json";
    $users = [];
    
    // Check if file exists. If it doesn't, save $users within $filename. If it exists get contents from $filename then decode and save it in $users.
    if(!file_exists($filename)){
        $json = json_encode($users);
        file_put_contents($filename, $json);
    }else{
        $json = file_get_contents($filename);
        $users = json_decode($json, true);
    }

    // Get the logged in userID from the parameter sent with GET request.
    $userID = $_GET["userID"];
    $loggedInUser = "";

    // Find the logged in user in users array.
    foreach($users as $user){
        if($user["id"] == $userID){
            $loggedInUser = $user;
        }
    }

    $usersFriendsWithUser = [];

    // Find all users that is friends with the logged in user.
    foreach($users as $user){
        if(in_array($user["id"], $loggedInUser["friends"])){
            unset($user["password"]);
            unset($user["friends"]);
            $usersFriendsWithUser[] = $user;
        }
    }

    sendJSON($usersFriendsWithUser, 200);
}

if($requestMethod == "POST"){
    $filename = "php/conversations.json";
    $conversations = [];
    
    // Check if file exists. If it doesn't, save $users within $filename. If it exists get contents from $filename then decode and save it in $users.
    if(!file_exists($filename)){
        $json = json_encode($conversations);
        file_put_contents($filename, $json);
    }else{
        $json = file_get_contents($filename);
        $conversations = json_decode($json, true);
    }

    $requestJSON = file_get_contents("php://input");
    $requestData = json_decode($requestJSON, true);

    /* needs to add message to both your own conversations and the one you're chatting with, when POST request, send ID of user and users friend to later find the right conversations */

    $action = $requestData["action"];
    $betweenUsers = $requestData["betweenUsers"];

    if($action === "fetchConversation"){
        foreach($conversations as $conversation){
            $usersInThisConvo = $conversation["betweenUsers"];
            $arraysDifference = array_diff($betweenUsers, $usersInThisConvo);

            if(count($arraysDifference) === 0){
                sendJSON($conversation, 200);
            }
        }
    }

    if($action === "postMessage"){
        $newMessage = $requestData["message"];
    
        foreach($conversations as $index => $conversation){
            $usersInThisConvo = $conversation["betweenUsers"];
            $arraysDifference = array_diff($betweenUsers, $usersInThisConvo);

            if(count($arraysDifference) === 0){
                $convoMessages = $conversation["messages"];
                $highestMessageID = 0;

                if(count($convoMessages) != 0){
                    foreach($convoMessages as $message){
                        if($message["id"] > $highestMessageID){
                            $highestMessageID = $message["id"];
                        }
                    }
                }

                $newMessage["id"] = $highestMessageID + 1;
                $conversations[$index]["messages"][] = $newMessage;
                
                $json = json_encode($conversations, JSON_PRETTY_PRINT);
                file_put_contents($filename, $json);

                sendJSON($newMessage, 200);
            }
        }
    }
}
?>

