<?php

require_once "functions.php";

function login($requestData, $users){
    //$loginInfoJSON = file_get_contents("php://input");
    //$loginInfo = json_decode($loginInfoJSON, true);

    $loginUsername = $requestData["username"];
    $loginPassword = $requestData["password"];
    //$usersArrayJSON = file_get_contents(__DIR__."/users.json");
    //$usersArray = json_decode($usersArrayJSON, true);
    
    for($i = 0; $i < count($users); $i++) {
        $user = $usersArray[$i];
        $arrayUsername = $users[$i]["username"];
        $arrayPassword = $users[$i]["password"];
    
        if($loginUsername == $arrayUsername && $loginPassword == $arrayPassword) {
            $message = ["id" => $user["id"], "username" => $user["username"]];
            sendJSON($message);      
        } 
    }
    
    $errorMessage = ["message" => "Wrong username or password"];
    sendJSON($errorMessage, 404);
}


?>