<?php

function friendRequests($requestData, $users, $allConversations){
    require_once "functions.php";

    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["PATCH", "DELETE"];
    checkMethod($requestMethod, $allowed);  

    if($requestMethod === "PATCH"){
        $requestFrom = $requestData["actionCredentials"]["requestFrom"];
        $requestTo = $requestData["actionCredentials"]["requestTo"];
        $action = $requestData["actionCredentials"]["requestAction"];
    
        if($action == "sendRequest"){
            foreach($users as $index => $user){
                if($user["username"] === $requestTo){
                    $activeRequests = $users[$index]["friendRequests"];
                    if(in_array($requestFrom ,$activeRequests)){
                        $message = ["message" => "You have already sent a friend request to $requestTo"];
                        sendJSON($message, 400);
                    }else{
                        $users[$index]["friendRequests"][] = $requestFrom;
    
                        putInUsersJSON($users);
                        $message = ["message" => "Friend request sent", "action" => "sendRequest"];
                        sendJSON($message);
                    }
                }
            }
        }
    
        if($action == "acceptRequest") {
    
            foreach($users as $index => $user){
                if($user["id"] == $requestTo){
                    $userFriends = $users[$index]["friends"];
                    $alreadyFriends = true;
                    if(!in_array($requestFrom, $userFriends)){
                        $users[$index]["friends"][] = $requestFrom;
                        $alreadyFriends = false;
                    }
    
                    $friendRequests = $users[$index]["friendRequests"];
    
                    foreach($friendRequests as $requestIndex => $request){
                        if($request == $requestFrom){
                            array_splice($users[$index]["friendRequests"], $requestIndex, 1);
                            
                            if($alreadyFriends){
                                putInUsersJSON($users);
                                $message = ["message" => "You are already friends", "action" => "acceptRequest"];
                                sendJSON($message, 400);
                            }else{
                                foreach($users as $index => $user){
                                    if($user["id"] == $requestFrom){
                                        $users[$index]["friends"][] = $requestTo;
                                        putInUsersJSON($users);
                                        
                                        $message = ["message" => "Friend request accepted", "action" => "acceptRequest"];
                                        sendJSON($message);
                                    }
                                }
                            }
                        }
                    }
                    
                }
            }  
        }
    
        if($action == "declineRequest") {
            foreach($users as $index => $user){
                if($user["id"] === $requestTo){
    
                    $friendRequests = $users[$index]["friendRequests"];
    
                    foreach($friendRequests as $requestIndex => $request){
                        if($request == $requestFrom){
                            array_splice($users[$index]["friendRequests"], $requestIndex, 1);
    
                            putInUsersJSON($users);
                            $message = ["message" => "Friend request declined", "action" => "declineRequest"];
                            sendJSON($message);
                        }
                    }
                }
            }
        }
    
        $message = ["message" => "Action not defined"];
        sendJSON($message, 400);
    }

    if($requestMethod === "DELETE"){
        if(!isset($requestData["actionCredentials"]["friendID"])){
            $error = ["message" => "Sorry, you didn't provide the required keys."];
            sendJSON($error, 400);
        }

        $userID = $requestData["userID"];
        $friendID = $requestData["actionCredentials"]["friendID"];
        
        $groupChats = $allConversations["groupChats"];
        $privateChats = $allConversations["privateChats"];

        // Remove friend from users friend array, and user from friends friend array.
        foreach($users as $userIndex => $user){
            if($user["id"] == $userID){
                $indexOfFriend = array_search($friendID, $user["friends"]);
                array_splice($users[$userIndex]["friends"], $indexOfFriend, 1);
            }
            if($user["id"] == $friendID){
                $indexOfUser = array_search($userID, $user["friends"]);
                array_splice($users[$userIndex]["friends"], $indexOfUser, 1);
            }
        }

        // Remove the chat between the user and the friend.
        foreach($privateChats as $chatIndex => $chat){
            $betweenUsers = $chat["betweenUsers"];

            if(in_array($userID, $betweenUsers) and in_array($friendID, $betweenUsers)){
                array_splice($allConversations["privateChats"], $chatIndex, 1);
            }
        }

        // If the user is in a groupchat where the removed friend is owner, leave that groupchat. 
        // If the removed friend is inside a groupchat where the user is owner, remove the friend from the groupchat.
        foreach($groupChats as $chatIndex => $chat){
            $betweenUsers = $chat["betweenUsers"];

            if($chat["ownerID"] === $userID){
                if(in_array($friendID, $betweenUsers)){
                    $indexOfFriend = array_search($friendID, $betweenUsers);
                    array_splice($allConversations["groupChats"][$chatIndex]["betweenUsers"], $indexOfFriend, 1);
                }
            }

            if($chat["ownerID"] === $friendID){
                if(in_array($userID, $betweenUsers)){
                    $indexOfUser = array_search($userID, $betweenUsers);
                    array_splice($allConversations["groupChats"][$chatIndex]["betweenUsers"], $indexOfUser, 1);
                }
            }
        }

        putInUsersJSON($users);
        putInConversationsJSON($allConversations);

        sendJSON($friendID, 200);
    }
}

?>