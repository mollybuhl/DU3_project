<?php

function friendRequests($requestData, $users){
    require_once "functions.php";

    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["PATCH"];
    checkMethod($requestMethod, $allowed);  

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
                $users[$index]["friends"][] = $requestFrom;

                $friendRequests = $users[$index]["friendRequests"];

                foreach($friendRequests as $requestIndex => $request){
                    if($request == $requestFrom){
                        array_splice($users[$index]["friendRequests"], $requestIndex, 1);

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

?>