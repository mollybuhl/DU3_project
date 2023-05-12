<?php
ini_set("display_errors", 1); 

require_once "functions.php";
require_once "friendRequests.php";
require_once "chat.php";
require_once "feed.php";
require_once "login.php";
require_once "myProfile.php";
require_once "register.php";
require_once "sharemood.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
if($requestMethod === "GET"){
    $requestData = $_GET;
}else{
    $requestJSON = file_get_contents("php://input");
    $requestData = json_decode($requestJSON, true);
}

$filenameUsers = __DIR__."/users.json";
$users = [];
if(!file_exists($filenameUsers)){
    $json = json_encode($users);
    file_put_contents($filenameUsers, $json);
}

$json = file_get_contents($filenameUsers);
$users = json_decode($json, true);

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

if(!$requestData["action"] == "login" || !$requestData["action"] == "register"){
    if(!isset($requestData["userID"]) || !isset($requestData["userPassword"]) || !isset($requestData["action"]) ){
        $message = ["message" => "Credentials missing"];
        sendJSON($message, 400);
    }else{
        $userID = $requestData["userID"];
        $userPassword = $requestData["userPassword"];
        checkCredentials($userID, $userPassword, $users);
    }    
}

//$userID = $requestData["userID"];
//$userPassword = $requestData["userPassword"];
//checkCredentials($userID, $userPassword, $users);


$action = $requestData["action"];
switch($action){
    case "register":
        require_once "register.php";
        register($requestData, $users);
        break;
    case "login":
        login($requestData, $users);
        break;
    case "feed":
        feed($requestData, $users);
        break;
    case "friendRequests":
        friendRequests($requestData);
        break;
    case "chat":
        require_once "chat.php";
        chat($requestData, $users, $allConversations);
        break;
    case "shareMood":
        require_once "sharemood.php";
        shareMood($requestData, $users);
        break;
    case "myProfile":
        require_once "myProfile.php";
        myProfile($requestData);
        break;
}


?>