<?php

require_once "functions.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["POST", "GET", "DELETE", "PATCH"];
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
    $allConversations = [];
    
    // Check if file exists. If it doesn't, save $users within $filename. If it exists get contents from $filename then decode and save it in $users.
    if(!file_exists($filename)){
        $json = json_encode($allConversations);
        file_put_contents($filename, $json);
    }else{
        $json = file_get_contents($filename);
        $allConversations = json_decode($json, true);
    }

    $requestJSON = file_get_contents("php://input");
    $requestData = json_decode($requestJSON, true);

    /* needs to add message to both your own conversations and the one you're chatting with, when POST request, send ID of user and users friend to later find the right conversations */

    $action = $requestData["action"];

    if(isset($requestData["type"])){
        $type = $requestData["type"];
        if($type == "privateChat"){
            $conversations = $allConversations[0]["privateChats"];
        }
        if($type == "groupChat"){
            $conversations = $allConversations[0]["groupChats"];
        }
    }
    if(isset($requestData["chatID"])){
        $chatID = $requestData["chatID"];
    }

    if($action === "fetchChat"){
        $users = json_decode(file_get_contents("php/users.json"), true);

        foreach($conversations as $conversation){
            if($chatID == $conversation["id"]){
                foreach($conversation["messages"] as $messageIndex => $message){
                    foreach($users as $user){   
                        if($user["id"] == $message["sender"]){
                            $conversation["messages"][$messageIndex]["sender"] = $user["username"];
                        }
                    }
                }
                sendJSON($conversation, 200);
            }
        }
        
        // REMINDER: this wont work, fix later
        if($type == "privateChat"){
            $newConversation = [
                "betweenUsers" => $betweenUsers,
                "messages" => []
            ];

            $highestConversationID = 0;

            foreach($conversations as $conversation){
                if($conversation["id"] > $highestConversationID){
                    $highestConversationID = $conversation["id"];
                }
            }

            $newConversation["id"] = $highestConversationID + 1;
    
            $allConversations[0]["privateChats"][] = $newConversation;
            $json = json_encode($allConversations, JSON_PRETTY_PRINT);
            file_put_contents($filename, $json);
    
            sendJSON($newConversation, 200);
        }

        $error = ["message" => "Sorry the chat was not found."];
        sendJSON($error, 404);
        
    }

    // Make new conversation for privateChats in this section instead
    if($action === "fetchChats"){

        if(!isset($requestData["userID"]) or !isset($requestData["userPassword"])){
            $message = ["message" => "Sorry you didn't provide the right information."];
            sendJSON($message, 400);
        }

        $userID = $requestData["userID"];
        $userPassword = $requestData["userPassword"];

        checkCredentials($userID, $userPassword);

        $userChats = [];

        foreach($conversations as $conversation){
            if(in_array($userID, $conversation["betweenUsers"])){
                $userChats[] = $conversation;
            }
        }

        sendJSON($userChats, 200);
    }

    if($action == "createGroupChat"){
        $conversations = $allConversations[0]["groupChats"];

        $groupName = $requestData["groupName"];
        $groupOwner = $requestData["groupOwner"];
        $groupOwnerPassword = $requestData["groupOwnerPassword"];
        $betweenUsers = $requestData["betweenUsers"];

        checkCredentials($groupOwner, $groupOwnerPassword);

        $newGroupChat = [
            "name" => $groupName,
            "owner" => $groupOwner,
            "betweenUsers" => $betweenUsers,
            "messages" => []
        ];

        $highestConversationID = 0;

        foreach($conversations as $conversation){
            if($conversation["id"] > $highestConversationID){
                $highestConversationID = $conversation["id"];
            }
        }

        $newGroupChat["id"] = $highestConversationID + 1;

        $allConversations[0]["groupChats"][] = $newGroupChat;

        $json = json_encode($allConversations, JSON_PRETTY_PRINT);
        file_put_contents($filename, $json);
        sendJSON($newGroupChat, 200);
    }

    if($action === "postMessage"){
        $typeInPlural = $type . "s";

        foreach($conversations as $convoIndex => $conversation){
            if($conversation["id"] == $chatID){
                $newMessage = $requestData["message"];
    
                foreach($conversations as $conversation){
                    $convoMessages = $conversation["messages"];
                    $highestMessageID = 0;
        
                    foreach($convoMessages as $message){
                        if($message["id"] > $highestMessageID){
                            $highestMessageID = $message["id"];
                        }
                    }
        
                    $newMessage["id"] = $highestMessageID + 1;  
                }

                $allConversations[0][$typeInPlural][$convoIndex]["messages"][] = $newMessage;
                        
                $json = json_encode($allConversations, JSON_PRETTY_PRINT);
                file_put_contents($filename, $json);
    
                sendJSON($newMessage, 200);
            }
        }
    }
}

if($requestMethod == "DELETE"){
// Ta bort gruppchatt
// Ta bort user från gruppchatt
// Lämna grupp
}

if($requestMethod == "PATCH"){
// Ändra namn på gruppchatt
// Lägga till personer i gruppchatt
}
?>

