<?php
ini_set("display_errors", 1); 

require_once "functions.php";
//require_once "addFriend.php";
//require_once "chat.php";
require_once "feed.php";
//require_once "login.php";
//require_once "myProfile.php";
//require_once "register.php";
//require_once "sharemood.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
if($requestMethod === "GET"){
    $requestData = $_GET;
}else{
    $requestJSON = file_get_contents("php://input");
    $requestData = json_decode($requestJSON, true);
}

if(!isset($requestData["userID"]) || !isset($requestData["userPassword"]) || !isset($requestData["action"]) ){
    $message = ["message" => "Credentials missing"];
    sendJSON($message, 400);
}

$filenameUsers = __DIR__."/users.json";
$users = [];
if(!file_exists($filenameUsers)){
    $json = json_encode($users);
    file_put_contents($filenameUsers, $json);
}

$json = file_get_contents($filenameUsers);
$users = json_decode($json, true);

$userID = $requestData["userID"];
$userPassword = $requestData["userPassword"];
checkCredentials($userID, $userPassword, $users);

$filenameConversations = __DIR__."/conversation.json";
$allConversations = [
    "privateChats" => [],
    "groupChats" => []
];

if(!file_exists($filenameConversations)){
    $json = json_encode($allConversations, JSON_PRETTY_PRINT);
    file_put_contents($filenameConversations, $json);
}

$json = file_get_contents($filenameConversations);
$allConversations = json_decode($json, true);

$action = $requestData["action"];
switch($action){
    case "register":
        register($requestData);
        break;
    case "login":
        login($requestData);
        break;
    case "feed":
        feed($requestData, $users);
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