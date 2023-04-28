<?php
require_once "functions.php";
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
            "loggedFeelings" => $user["loggedFeelings"]
        ];
        sendJSON($rightUser);
    }
}
?>