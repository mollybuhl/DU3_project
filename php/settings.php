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
    $existingUsername = $userData["existingUsername"];
    $userId = $userData["userID"];
    $typedInPassword = $userData["userPassword"];
    $newUsername = $userData["newUsername"];

    for($i = 0; $i < count($usersArray); $i++) {
        $storedUsername = $usersArray[$i]["username"];
        $storedUserId = $usersArray[$i]["id"];
        $storedPassword = $usersArray[$i]["password"];

        if($storedUsername == $existingUsername && $userId == $storedUserId && $storedPassword == $typedInPassword) {
            $usersArray[$i]["username"] = $newUsername;
            $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
            file_put_contents($filename, $usersArrayJSON);
            $message = [
            "message" => "The change to username: $newUsername was successful",
            "newUsername" => $newUsername
            ];
            sendJSON($message);
        }
    }

    $message = ["message" => "You typed in the wrong username or password"];
    sendJSON($message, 404);
}
?>