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
?>

<?php
$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["POST"];
checkMethod($requestMethod, $allowed);

$filename = "php/users.json";
$users = [];

if(!file_exists($filename)){
    $json = json_encode($users);
    file_put_contents($filename, $json);
}else{
    $json = file_get_contents($filename);
    $users = json_decode($json, true);
}

$requestJSON = file_get_contents("php://input");
$requestData = json_decode($requestJSON, true);

$username = $requestData["username"];
$password = $requestData["password"];

if($username == "" or $password == ""){
    $message = ["message" => "Sorry, the fields can't be left empty."];
    sendJSON($message, 400);
};

$newUser = [
    "username" => $username,
    "password" => $password,
    "loggedFeelings" => [],
    "friends" => [],
    "profilePicture" => ""
];

$users[] = $newUser;

$json = json_encode($users, JSON_PRETTY_PRINT);
file_put_contents($filename, $json);

sendJSON($newUser["username"], 200);

?>