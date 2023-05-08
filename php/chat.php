<?php

function chat($data, $users, $allConversations){

    require_once "functions.php";

    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["POST", "GET", "DELETE", "PATCH"];
    checkMethod($requestMethod, $allowed);

    if($requestMethod == "GET"){

        // Get the logged in userID from the parameter sent with GET request.
        $userID = $data["userID"];

        // Find the logged in user in users array.
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

    if($requestMethod == "POST"){
        $chatAction = $data["chatAction"];

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

        if($chatAction === "fetchChat"){
            $userID = $data["userID"];

            foreach($conversations as $conversation){
                if($chatID == $conversation["id"]){
                    if(in_array($userID, $conversation["betweenUsers"])){
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
            }

            $error = ["message" => "Sorry the chat was not found."];
            sendJSON($error, 404);
        }

        if($chatAction === "fetchChats"){
            $userID = $data["userID"];
            $userChats = [];

            foreach($conversations as $conversation){
                if(in_array($userID, $conversation["betweenUsers"])){
                    $userChats[] = $conversation;
                }
            }

            sendJSON($userChats, 200);
        }

        if($chatAction == "createGroupChat"){
            $conversations = $allConversations["groupChats"];

            $chatName = $data["chatName"];
            $chatOwner = $data["userID"];
            $betweenUsers = $data["betweenUsers"];

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

        if($chatAction == "createPrivateChat"){
            $conversations = $allConversations["privateChats"];

            $userID = $data["userID"];
            $betweenUsers = $data["betweenUsers"];

            $highestConversationID = 0;

            foreach($conversations as $conversation){
                if($conversation["id"] > $highestConversationID){
                    $highestConversationID = $conversation["id"];
                }
            }

            $newConversation = [
                "id" => $highestConversationID + 1,
                "betweenUsers" => $betweenUsers,
                "messages" => []
            ];

            $allConversations["privateChats"][] = $newConversation;

            putInConversationsJSON($allConversations);
            sendJSON($newConversation, 200);
        }

        if($chatAction === "postMessage"){
            $userID = $data["message"]["sender"];
            $typeInPlural = $type . "s";

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
        }
    }

    if($requestMethod == "DELETE"){
        
        $groupChats = $allConversations["groupChats"];

        $chatAction = $data["chatAction"];
        $chatID = $data["chatID"];
        $userID = $data["userID"];

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
        }

        if($chatAction == "leaveGroup"){
            foreach($groupChats as $chatIndex => $chat){
                if($chat["id"] == $chatID){
                    $indexOfUserID = array_search($userID, $chat["betweenUsers"]);
                    unset($allConversations["groupChats"][$chatIndex]["betweenUsers"][$indexOfUserID]);

                    putInConversationsJSON($allConversations);
                    sendJSON($chat, 200);
                }
            }
        }
    }

    if($requestMethod == "PATCH"){
        $groupChats = $allConversations["groupChats"];

        $chatAction = $data["action"];
        $chatID = $data["chatID"];
        $userID = $data["userID"];

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
        }

        if($chatAction == "changeGroupName"){
            $newGroupName = $data["name"];

            foreach($groupChats as $chatIndex => $chat){
                if($chat["id"] == $chatID){
                    if($userID == $chat["ownerID"]){
                        $allConversations["groupChats"][$chatIndex]["name"] = $newGroupName;
                        
                        putInConversationsJSON($allConversations);
                        sendJSON($chat, 200);
                    }
                }
            }
        }
    }

}
?>