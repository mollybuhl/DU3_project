<?php
/*
If it's the first time they log in, render mood page, 
otherwise, render feed page.
Check key in JSON file? If set to true or false, for example: 
loggedInBefore: true/false
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
    //$loggedInBefore = $usersArray[$i]["loggedInBefore"];

    if($loginUsername == $arrayUsername && $loginPassword == $arrayPassword) {
        if($loggedInBefore == false) {
            $message = ["username" => $user["username"], "loggedInBefore" => false];
    
        }        
    } 
}

?>