<?php
function checkNameLength($name){
    if(strlen($name) > 12){
        $error = ["message" => "The name can't be longer than 12 characters."];
        sendJSON($error, 400);
    }
    if(strlen($name) < 2){
        $error = ["message" => "The name has to be at least two characters long"];
        sendJSON($error, 400);
    }
}

function chatNotFound(){
    $error = ["message" => "Sorry, the chat was not found."];
    sendJSON($error, 404);
}

function badRequestKeys(){
    $error = ["message" => "Sorry, you didn't provide all the required keys for this request"];
    sendJSON($error, 400);
}

function chat($data, $users, $allConversations){
    require_once "functions.php";

    // Check method
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["POST", "GET", "DELETE", "PATCH"];
    checkMethod($requestMethod, $allowed);

    // If request method is GET
    if($requestMethod == "GET"){
        $userID = $data["userID"];

        // Find the user with the ID in variable userID, then find all the users that are friends with the user. Return all the friends objects, without the password and friends keys.
        foreach($users as $user1){
            if($user1["id"] == $userID){

                $userFriends = [];
                foreach($users as $user2){
                    if(in_array($user2["id"], $user1["friends"])){
                        unset($user2["password"]);
                        unset($user2["friends"]);
                        $userFriends[] = $user2;
                    }
                }
                sendJSON($userFriends, 200);
            }
        }
    }

    // If request method is POST
    if($requestMethod == "POST"){
        $chatAction = $data["chatAction"];

        // If the type key is sent in the body, get the right array depending on which chat type (privateChat/groupChat)
        if(isset($data["type"])){
            $type = $data["type"];

            if($type == "privateChat"){
                $conversations = $allConversations["privateChats"];
            }
            if($type == "groupChat"){
                $conversations = $allConversations["groupChats"];
            }
        }

        if(isset($data["chatID"])){
            $chatID = $data["chatID"];
        }

        // If chatAction is "fetchChat"
        if($chatAction === "fetchChat"){
            $userID = $data["userID"];
            if(!isset($data["type"]) or !isset($data["chatID"])){
                badRequestKeys();
            }

            // First find the conversation that matches with the chatID sent in the request. Then add the name and profilepictureURL of the sender in each message within the chat/conversation.
            foreach($conversations as $conversation){
                if($chatID == $conversation["id"]){
                    if(in_array($userID, $conversation["betweenUsers"])){
                        foreach($conversation["messages"] as $messageIndex => $message){
                            foreach($users as $user){   
                                if($user["id"] == $message["sender"]){
                                    $conversation["messages"][$messageIndex]["senderName"] = $user["username"];
                                    $profilePicURL = $user["profilePicture"];
                                    $conversation["messages"][$messageIndex]["profilePicture"] = $profilePicURL;
                                }
                            }
                        }
                        sendJSON($conversation, 200);
                    }
                }
            }

            chatNotFound();
        }

        // If chatAction is "fetchChats"
        if($chatAction === "fetchChats"){
            if(!isset($data["type"])){
                badRequestKeys();
            }

            $userID = $data["userID"];
            $userChats = [];

            // Find all the chats that the user is a part of and put them in $userChats. Also find all the users in users.json to put some information about each member to render the members list for the chat.
            foreach($conversations as $conversation){
                if(in_array($userID, $conversation["betweenUsers"])){
                    $members = [];
                    foreach($conversation["betweenUsers"] as $user){
                        foreach($users as $userObject){
                            if($userObject["id"] == $user){
                                $member = ["id" => $userObject["id"], "username" => $userObject["username"], "profilePicture" => $userObject["profilePicture"]];
                                $members[] = $member;
                            }
                        }
                    }
                    $conversation["members"] = $members;
                    $userChats[] = $conversation;
                }
            }

            sendJSON($userChats, 200);
        }

        // If chatAction is "createGroupChat", create a new groupChat with the sent information and put it in conversations.json.
        if($chatAction == "createGroupChat"){
            if(!isset($data["chatName"]) or !isset($data["betweenUsers"])){
                badRequestKeys();
            }

            $conversations = $allConversations["groupChats"];

            $chatName = $data["chatName"];
            $chatOwner = $data["userID"];
            $betweenUsers = $data["betweenUsers"];

            checkNameLength($chatName);

            $highestConversationID = 0;

            foreach($conversations as $conversation){
                if($conversation["id"] > $highestConversationID){
                    $highestConversationID = $conversation["id"];
                }
            }

            $newGroupChat = [
                "id" => $highestConversationID + 1,
                "name" => $chatName,
                "ownerID" => $chatOwner,
                "betweenUsers" => $betweenUsers,
                "messages" => []
            ];

            $allConversations["groupChats"][] = $newGroupChat;

            putInConversationsJSON($allConversations);
            sendJSON($newGroupChat, 200);
        }

        // If chatAction is "createPrivateChat", create a new privateChat between the users sent in $betweenUsers and put it in conversations.json.
        if($chatAction == "createPrivateChat"){
            if(!isset($data["betweenUsers"])){
                badRequestKeys();
            }

            $conversations = $allConversations["privateChats"];

            $userID = $data["userID"];
            $betweenUsers = $data["betweenUsers"];

            $highestConversationID = 0;

            foreach($conversations as $conversation){
                if($conversation["id"] > $highestConversationID){
                    $highestConversationID = $conversation["id"];
                }
            }

            // Find all members assoicative arrays in users.json and put information about them to make the members list work on a newly created chat.
            $members = [];
            foreach($betweenUsers as $user){
                foreach($users as $userObject){
                    if($userObject["id"] == $user){
                        $member = ["id" => $userObject["id"], "username" => $userObject["username"], "profilePicture" => $userObject["profilePicture"]];
                        $members[] = $member;
                    }
                }
            }
        
            $newConversation = [
                "id" => $highestConversationID + 1,
                "betweenUsers" => $betweenUsers,
                "messages" => []
            ];

            $copyOfNewConvo = $newConversation;

            $copyOfNewConvo["members"] = $members;

            $allConversations["privateChats"][] = $newConversation;

            putInConversationsJSON($allConversations);
            sendJSON($copyOfNewConvo, 200);
        }

        // If chatAction is "postMessage"
        if($chatAction === "postMessage"){
            $userID = $data["message"]["sender"];
            $typeInPlural = $type . "s";

            // find the chat with the chatID sent in the request, then add the new message to the messages array within that chat.
            foreach($conversations as $convoIndex => $conversation){
                if($conversation["id"] == $chatID){
                    if(in_array($userID, $conversation["betweenUsers"])){
                        $newMessage = $data["message"];

                        $convoMessages = $conversation["messages"];
                        $highestMessageID = 0;
                
                        foreach($convoMessages as $message){
                            if($message["id"] > $highestMessageID){
                                $highestMessageID = $message["id"];
                            }
                        }
                
                        $newMessage["id"] = $highestMessageID + 1;  
        
                        $allConversations[$typeInPlural][$convoIndex]["messages"][] = $newMessage;
                                
                        putInConversationsJSON($allConversations);
                        sendJSON($newMessage, 200);
                    }
                }
            }
            chatNotFound();
        }
    }

    // If requestMethod is DELETE
    if($requestMethod == "DELETE"){
        
        $groupChats = $allConversations["groupChats"];

        $chatAction = $data["chatAction"];
        $chatID = $data["chatID"];
        $userID = $data["userID"];

        // If chatAction is "deleteGroup", find the chat with the chatID sent in the request, and remove it.
        if($chatAction == "deleteGroup"){
            foreach($groupChats as $chatIndex => $chat){
                if($chat["id"] == $chatID){
                    if($chat["ownerID"] == $userID){
                        unset($allConversations["groupChats"][$chatIndex]);

                        putInConversationsJSON($allConversations);
                        sendJSON($chat, 200);
                    }
                }
            }
            chatNotFound();
        }

        // If chatAction is "leaveGroup", find the chat with the chatID sent in the request, and remove $userID from the betweenUsers array in that chat.
        if($chatAction == "leaveGroup"){
            foreach($groupChats as $chatIndex => $chat){
                if($chat["id"] == $chatID){
                    $indexOfUserID = array_search($userID, $chat["betweenUsers"]);
                    array_splice($allConversations["groupChats"][$chatIndex]["betweenUsers"], $indexOfUserID, 1);

                    putInConversationsJSON($allConversations);
                    sendJSON($chat, 200);
                }
            }
            chatNotFound();
        }
    }

    if($requestMethod == "PATCH"){
        $groupChats = $allConversations["groupChats"];

        $chatAction = $data["chatAction"];
        $chatID = $data["chatID"];
        $userID = $data["userID"];

        // If chatAction is "editMembers", find the chat with the chatID sent in the request, and set the betweenUsers array sent in the request as the new betweenUsers array in the chat object, then return the updated chat object.
        if($chatAction == "editMembers"){
            $updatedMembers = $data["betweenUsers"];

            foreach($groupChats as $chatIndex => $chat){
                if($chat["id"] == $chatID){
                    if($userID == $chat["ownerID"]){
                        $allConversations["groupChats"][$chatIndex]["betweenUsers"] = $updatedMembers;

                        putInConversationsJSON($allConversations);
                        sendJSON($chat, 200);
                    }
                }
            }
            chatNotFound();
        }

        // If chatAction is "changeGroupName", find the chat with the chatID sent in the request, and set the name to the new name sent in the request, then return the new name. 
        if($chatAction == "changeGroupName"){
            $newGroupName = $data["name"];
            
            checkNameLength($newGroupName);

            foreach($groupChats as $chatIndex => $chat){
                if($chat["id"] == $chatID){
                    if($userID == $chat["ownerID"]){
                        $allConversations["groupChats"][$chatIndex]["name"] = $newGroupName;
                        
                        putInConversationsJSON($allConversations);
                        sendJSON($newGroupName, 200);
                    }
                }
            }
            chatNotFound();
        }
    }
}
?>