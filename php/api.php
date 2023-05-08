<?php
ini_set("display_errors", 1); 

require_once "functions.php";
require_once "addFriend.php";
require_once "chat.php";
require_once "feed.php";
require_once "login.php";
require_once "myProfile.php";
require_once "register.php";
require_once "sharemood.php";

//Check credentials
$requestJSON = file_get_contents("php://input");
$requestData = json_decode($requestJSON, true);

if(!isset($requestData["userID"]) || !isset($requestData["userPassword"]) || !isset($requestData["action"]) ){
    $message = ["message" => "Credentials missing"];
    sendJSON($message, 400);
}

$userID = $requestData["userID"];
$userPassword = $requestData["userPassword"];
checkCredentials($userID, $userPassword);

//Check if users.json exists
$filename = __DIR__."/users.json";
if(!file_exists($filename)){
    $message = ["message" => "File not found. Please try again later."];
    sendJSON($message, 404);
}

//Check if conversation.json
if(!file_exists(__DIR__."/conversation.json")){
    $message = ["message" => "File not found. Please try again later."];
    sendJSON($message, 404);
}

$action = $requestData["action"];

switch($action){
    case "register":
        register($requestData);
        break;
    case "login":
        login($requestData);
        break;
    case "feed":
        feed($requestData);
        break;
    case "addFriend":
        addFriend($requestData);
        break;
    case "chat":
        chat($requestData);
        break;
    case "shareMood":
        shareMood();
        break;
    case "myProfile":
        myProfile($requestData);
        break;
}


?>