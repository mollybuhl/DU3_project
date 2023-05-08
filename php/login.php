<?php

require_once "functions.php";

$loginInfoJSON = file_get_contents("php://input");
$loginInfo = json_decode($loginInfoJSON, true);
$loginUsername = $loginInfo["username"];
$loginPassword = $loginInfo["password"];
$usersArrayJSON = file_get_contents(__DIR__."users.json");
$usersArray = json_decode($usersArrayJSON, true);

for($i = 0; $i < count($usersArray); $i++) {
    $user = $usersArray[$i];
    $arrayUsername = $usersArray[$i]["username"];
    $arrayPassword = $usersArray[$i]["password"];

    if($loginUsername == $arrayUsername && $loginPassword == $arrayPassword) {
        $message = ["id" => $user["id"], "username" => $user["username"]];
        sendJSON($message);      
    } 
}

$errorMessage = ["message" => "Wrong username or password"];
sendJSON($errorMessage, 404);

?>