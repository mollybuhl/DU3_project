<?php
require_once "functions.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];

if($requestMethod == "GET") {
    getProfile();
} else if($requestMethod == "POST") {
    storeUserMoods();
}

function getProfile() {
    if(isset($_GET["id"])) {
        $activeUserId = $_GET["id"];
    }
    
    if(file_exists("users.json")) {
        $usersArrayJSON = file_get_contents("users.json");
        $usersArray = json_decode($usersArrayJSON, true);
    }
    
    foreach($usersArray as $user) {
        $savedUserId = $user["id"];
        if($savedUserId == $activeUserId) {
            $rightUser = [
                "profilePicture" => $user["profilePicture"], 
                "username" => $user["username"], 
                "postsOfUser" => $user["posts"],
                "storedMoods" => $user["loggedFeelings"]
            ];
            sendJSON($rightUser);
        }
    }
    
    $errorMessage = ["message" => "Unable to find user"];
    sendJSON($errorMessage, 404);
}

function storeUserMoods() {

}

?>