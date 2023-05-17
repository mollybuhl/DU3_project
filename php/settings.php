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

    if($username == "" || $typedInPassword == "" || $newPassword == "") {
        $message = ["message" => "You didn't fill in all the slots"];
        sendJSON($message, 400);
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
    if(file_exists($filename)) {
        $usersArrayJSON = file_get_contents($filename);
    }

    $usersArray = json_decode($usersArrayJSON, true);
    $username = $userData["username"];
    $userId = $userData["userID"];
    $typedInPassword = $userData["userPassword"];

    if($username == "" || $typedInPassword == "") {
        $message = ["message" => "You didn't fill in all of the slots"];
        sendJSON($message, 400);
    }

    for($i = 0; $i < count($usersArray); $i++) {
        $storedUserId = $usersArray[$i]["id"];
        $storedUsername = $usersArray[$i]["username"];
        $storedPassword = $usersArray[$i]["password"];

        if($storedUserId == $userId && $storedUsername == $username && $storedPassword == $typedInPassword) {
            array_splice($usersArray, $i, 1);
            $deleted = true;
            foreach($usersArray as $user) {
                $userIdInArray = $user["id"];
                if($userIdInArray == $userId) {
                    $deleted = false;
                    $errorMessage = ["message" => "Account wasn't able to be deleted"];
                    sendJSON($errorMessage, 500);
                }
            }

            if($deleted) {
                $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
                file_put_contents($filename, $usersArrayJSON);
                $message = [
                    "message" => "Your account was successfully deleted. You will now be directed to the home page",
                    "deletedAccount" => true
                ];

                sendJSON($message);
            }
        }
    }    
}
?>