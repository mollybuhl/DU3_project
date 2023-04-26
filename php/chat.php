<?php
/* 

TO DO:
Fix post function so that you can post a message, an object that is pushed to both the sender and receivers privateMessage array
Fix so that when private chat is clicked, messages appear.
Conversations array that stores conversations with each friend instead of private message array?
Each conversation has messages, and each message has an ID to sort them after when they were sent.
Conversatioin strcuture:
{
    toUser: int,
    messages: []
}

privateMessege structure: 
{
    fromUser: int,
    toUser: int,
    message: string,
    timestamp: string,
}

*/

require_once "functions.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["POST", "GET"];
checkMethod($requestMethod, $allowed);

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

if($requestMethod == "GET"){
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
            $usersFriendsWithUser[] = $user;
        }
    }

    // Remove every conversation that is not your conversation, from every friend.
    foreach($usersFriendsWithUser as $userFriend){
        $userFriendConversations = $userFriend["conversations"];

        foreach($conversations as $index => $conversation){
            if($conversation["toUser"] != $userID){
                unset($userFriend["conversations"][$index]);
            }
        }
    }

    sendJSON($usersFriendsWithUser, 200);
}
if($requestMethod == "POST"){

    $requestJSON = file_get_contents("php://input");
    $requestData = json_decode($requestJSON, true);

    /* needs to add message to both your own conversations and the one you're chatting with, when POST request, send ID of user and users friend to later find the right conversations */

    $senderID = $requestData["senderID"];
    $receiverID = $requestData["receiverID"];
    $message = $requestData["message"];
    
    // Find the user that sent the message and add the message to the array of message within the conversation linked with the friend user is chatting with.
    foreach($users as $user){
        if($user["id"] == $senderID){
            // Find the conversation linked with the friend the user is chatting with.
            foreach($user["conversations"] as $index => $conversation){

                // If found, add the message to the messages array within the correct conversation, also add a unique ID to the message.
                if($receiverID == $conversation["toUser"]){
                    $highestMessageID = 1;
                    foreach($user["conversation"][$index]["messages"] as $message){
                        if($message["id"] > $highestMessageID){
                            $highestMessageID = $message["id"];
                        }
                    }
                    $message[] = ["id" => $highestMessageID + 1];

                    $user["conversations"][$index]["messages"][] = $message;
                }
            }
        }

        // Same as above, only that the message is added to receivers conversation array instead.
        if($user["id"] == $receiverID){
            foreach($user["conversations"] as $index => $conversation){
                if($senderID == $conversation["toUser"]){
                    $highestMessageID = 1;
                    foreach($user["conversation"][$index]["messages"] as $message){
                        if($message["id"] > $highestMessageID){
                            $highestMessageID = $message["id"];
                        }
                    }
                    $message[] = ["id" => $highestMessageID + 1];

                    $user["conversations"][$index]["messages"][] = $message;
                }
            }
        }
    }

    $json = json_encode($filename);
    file_put_contents($filename, $json);
}
?>