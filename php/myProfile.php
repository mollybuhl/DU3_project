<?php
require_once "functions.php";

function myProfile() {
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowedMethods = ["GET", "POST"];

    checkMethod($requestMethod, $allowedMethods);

    if($requestMethod == "GET") {
        getProfileInfo();
    } else if($requestMethod == "POST") {
        getOrStoreUserMoods();
    }
}

function getProfileInfo() {
    if(isset($_GET["userID"])) {
        $activeUserId = $_GET["userID"];
    }
    
    if(file_exists(__DIR__."/users.json")) {
        $usersArrayJSON = file_get_contents(__DIR__."/users.json");
        $usersArray = json_decode($usersArrayJSON, true);
    }
    
    foreach($usersArray as $user) {
        $savedUserId = $user["id"];
        if($savedUserId == $activeUserId) {
            $rightUser = [
                "profilePicture" => $user["profilePicture"], 
                "username" => $user["username"], 
            ];
            sendJSON($rightUser);
        }
    }
    
    $errorMessage = ["message" => "Unable to find user"];
    sendJSON($errorMessage, 404);
}

function getOrStoreUserMoods() {
    $userDataJSON = file_get_contents("php://input");
    $userData = json_decode($userDataJSON, true);

    if(isset($userData["storedMoods"])) {
        $rightUserId = $userData["userID"];
        $calendarData = $userData["storedMoods"];
        $filename = __DIR__."/users.json";
    
        if(file_exists(__DIR__."/users.json")) {
            $usersArrayJSON = file_get_contents(__DIR__."/users.json");
            $usersArray = json_decode($usersArrayJSON, true);
        }

        foreach($usersArray as $index => $user) {
            $arrayUserId = $user["id"];
            if($arrayUserId == $rightUserId) {
                $usersArray[$index]["loggedFeelings"] = $calendarData;
                $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
                file_put_contents($filename, $usersArrayJSON);
                $message = ["message" => "Storing the moods was successfull"];
                sendJSON($message);
            }
        }
    } else {
        if(file_exists(__DIR__."/users.json")) {
            $usersArrayJSON = file_get_contents(__DIR__."/users.json");
            $usersArray = json_decode($usersArrayJSON, true);
        }

        $activeUserId = $userData["userID"];
        foreach($usersArray as $user) {
            $savedUserId = $user["id"];
            if($savedUserId == $activeUserId) {
                $rightUserMoods = [
                    "storedMoods" => $user["loggedFeelings"],
                    "postsOfUser" => $user["posts"]
                ];
                sendJSON($rightUserMoods);
            }
        }
        $errorMessage = ["message" => "Something went wrong. Please reload the page."];
        sendJSON($errorMessage, 400);
    }
}
?>