<?php
/*
If it's the first time they log in, render mood page, 
otherwise, render feed page.
Check key in JSON file? If set to true or false, for example: 
firstTime: true/false
*/ 
require_once "functions.php";

$loginInfoJSON = file_get_contents("php://input");
$loginInfo = json_decode($loginInfoJSON, true);
$loginUsername = $loginInfo["username"];
$loginPassword = $loginInfo["password"];

$usersArrayJSON = file_get_contents("users.json");
$usersArray = json_decode($usersArrayJSON, true);

for($i = 0; $i < count($usersArray); $i++) {
    $user = $usersArray[$i];
    $arrayUsername = $usersArray[$i]["username"];
    $arrayPassword = $usersArray[$i]["password"];
    //$firstTime = $usersArray[$i]["firstTime"];

    if($loginUsername == $arrayUsername && $loginPassword == $arrayPassword) {
        if($firstTime == true) {
            $message = ["id" => $user["id"], "username" => $user["username"], "firstTime" => true];
            
            $usersArray[$i]["firstTime"] = false;
            $usersArrayJSON = json_encode($usersArray, JSON_PRETTY_PRINT);
            file_put_contents("users.json", $usersArrayJSON);
            sendJSON($message);
        } else {
            $message = ["id" => $user["id"], "username" => $user["username"], "firstTime" => false];
            sendJSON($message);
        }       
    } 
}

$errorMessage = ["message" => "Wrong username or password"];
sendJSON($errorMessage, 404);

?>