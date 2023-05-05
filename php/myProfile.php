<?php
require_once "functions.php";
if(isset($_GET["id"])) {
    $activeUserId = $_GET["id"];
}

if(file_exists("php/users.json")) {
    $usersArrayJSON = file_get_contents("php/users.json");
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