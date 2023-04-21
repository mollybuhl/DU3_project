<?php 
/* 
$usedMethod = a string - the method used in the request.
$allowedMethods = an array that contains the methods that are allowed.

If $usedMethod is not in $allowedMethods, return a message with status 405.
*/

function checkMethod($usedMethod, $allowedMethods){
    if(!in_array($usedMethod, $allowedMethods)){
        $message = ["message" => "Sorry the $usedMethod method is not allowed"];
        sendJSON($message, 405);
    }
}

function sendJSON($message, $statusCode = 200){
    header("Content-Type: application/json");
    http_response_code($statusCode);
    $json = json_encode($message);
    echo $json;
    exit();
}
?>