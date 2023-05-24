<?php
require_once "functions.php";

function editSettings() {
    $allowedMethods = ["PATCH", "DELETE"];
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    checkMethod($requestMethod, $allowedMethods);

    $JSONdata = file_get_contents("php://input");

    $userData = json_decode($JSONdata, true);

    if($requestMethod == "PATCH" && isset($userData["newUsername"])) {
        changeUsername($userData);
    } else if($requestMethod == "PATCH" && isset($userData["newPassword"])) {
        changePassword($userData);
    } else if($requestMethod == "DELETE") {
        deleteUserAccount($userData);
    }
}

function changeUsername($userData) {
    $filename = __DIR__."/users.json";
    if(file_exists($filename)) {
        $usersArrayJSON = file_get_contents($filename);
    }

    $usersArray = json_decode($usersArrayJSON, true);
    $currentUsername = $userData["username"];
    $userId = $userData["userID"];
    $typedInPassword = $userData["userPassword"];
    $newUsername = $userData["newUsername"];

    if($currentUsername == "" || $typedInPassword == "" || $newUsername == "") {
        $message = ["message" => "You didn't fill in all the slots"];
        sendJSON($message, 400);
    }

    for($i = 0; $i < count($usersArray); $i++) {
        $storedUsername = $usersArray[$i]["username"];
        $storedUserId = $usersArray[$i]["id"];
        $storedPassword = $usersArray[$i]["password"];

        if($storedUsername == $currentUsername && $userId == $storedUserId && $storedPassword == $typedInPassword) {
            if($storedUsername == $newUsername) {
                $errorMessage = ["message" => "Your new username can't be the same as your current one"];
                sendJSON($errorMessage, 400);
            } 
            $usersArray[$i]["username"] = $newUsername;
            $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
            file_put_contents($filename, $usersArrayJSON);
            $message = [
            "message" => "The change to username '$newUsername' was successful",
            "newUsername" => $newUsername
            ];
            sendJSON($message);
        } else if($storedUsername == $newUsername && $currentUsername != $newUsername) {
            $errorMessage = ["message" => "This username is already taken. Please pick another"];
            sendJSON($errorMessage, 400);
        }
    }

    $errorMessage = ["message" => "You typed in the wrong username or password"];
    sendJSON($errorMessage, 404);
}

function changePassword($userData) {
    $filename = __DIR__."/users.json";
    if(file_exists($filename)) {
        $usersArrayJSON = file_get_contents($filename);
    }

    $usersArray = json_decode($usersArrayJSON, true);
    $username = $userData["username"];
    $userId = $userData["userID"];
    $typedInPassword = $userData["userPassword"];
    $newPassword = $userData["newPassword"];
    $newPasswordCopy = $userData["newPasswordCopy"];

    if($username == "" || $typedInPassword == "" || $newPassword == "" || $newPasswordCopy == "") {
        $errorMessage = ["message" => "You didn't fill in all the slots"];
        sendJSON($errorMessage, 400);
    }

    if($newPassword != $newPasswordCopy) {
        $errorMessage = ["message" => "The new password is not the same in both input fields"];
        sendJSON($errorMessage, 400);
    }

    for($i = 0; $i < count($usersArray); $i++) {
        $storedUserId = $usersArray[$i]["id"];
        $storedUsername = $usersArray[$i]["username"];
        $storedPassword = $usersArray[$i]["password"];

        if($storedUserId == $userId && $storedUsername == $username && $storedPassword == $typedInPassword) {
            if($storedPassword == $newPassword) {
                $errorMessage = ["message" => "Your new password can't be the same as your current one"];
                sendJSON($errorMessage, 400);
            }

            $usersArray[$i]["password"] = $newPassword;
            $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
            file_put_contents($filename, $usersArrayJSON);
            $message = ["message" => "Your password was successfully changed"];
            sendJSON($message);
        }
    }

    $errorMessage = ["message" => "You typed in the wrong username or password"];
    sendJSON($errorMessage, 404);
}

function deleteUserAccount($userData) {
    $filename = __DIR__."/users.json";
        
    $usersArrayJSON = file_get_contents($filename);
    $usersArray = json_decode($usersArrayJSON, true);
    $username = $userData["username"];
    $userId = $userData["userID"];
    $typedInPassword = $userData["userPassword"];

    if($username == "" || $typedInPassword == "") {
        $message = ["message" => "You didn't fill in all the slots"];
        sendJSON($message, 400);
    }

    $userFound = false;
    for($i = 0; $i < count($usersArray); $i++) {
        $storedUserId = $usersArray[$i]["id"];
        $storedUsername = $usersArray[$i]["username"];
        $storedPassword = $usersArray[$i]["password"];

        if($storedUserId == $userId && $storedUsername == $username && $storedPassword == $typedInPassword) {
            $userFound = true;
            array_splice($usersArray, $i, 1);
            $deleted = true;
        }
    }
    if(!$userFound) {
        $errorMessage = ["message" => "You typed in the wrong username or password"];
        sendJSON($errorMessage, 404);
    }   

    foreach($usersArray as $user) {
        $userIdInArray = $user["id"];
        if($userIdInArray == $userId) {
            $deleted = false;
            $errorMessage = ["message" => "The account wasn't able to be deleted"];
            sendJSON($errorMessage, 500);
        }
    }  

    if($deleted) {

        //Delete user from friendlists
        foreach ($usersArray as $userIndex => $user) {
            $userFriends = $user["friends"];
            foreach ($userFriends as $friendIndex => $friend) {
                if($friend == $userId){
                    array_splice($usersArray[$userIndex]["friends"], $friendIndex, 1);
                }
            }
        }

        //Delete users conversations
        $filenameConversation = __DIR__."/conversations.json";
        $conversationsJSON = file_get_contents($filenameConversation);
        $conversations = json_decode($conversationsJSON, true);
        $privateChats = $conversations["privateChats"];
        $groupChats = $conversations["groupChats"];

        //Private conversations
        foreach($privateChats as $chatIndex => $chat){
            $betweenUsers = $chat["betweenUsers"];
            foreach($betweenUsers as $chatUserIndex => $chatUser){
                if($chatUser == $userId){
                    array_splice($conversations["privateChats"], $chatIndex, 1);
                }
            }
        }

        //Groupchats
        foreach($groupChats as $groupIndex => $group){

            if($group["ownerID"] == $userId){
                array_splice($conversations["groupChats"], $groupIndex, 1);
            }else{
                $groupMembers = $group["betweenUsers"];
                foreach ($groupMembers as $memberIndex => $member) {
                    if($member == $userId){
                        array_splice($conversations["groupChats"][$groupIndex]["betweenUsers"], $memberIndex, 1); 
                    }
                }
            }
        }

        $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
        file_put_contents($filename, $usersArrayJSON);

        $conversations = json_encode($conversations, JSON_PRETTY_PRINT);
        file_put_contents($filenameConversation, $conversations);


        $message = [
            "message" => "Your account was successfully deleted. You will now be directed to the start page",
            "deletedAccount" => true
        ];

        sendJSON($message);
    }      
}    
?>