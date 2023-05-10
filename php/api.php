<?php
ini_set("display_errors", 1); 

require_once "functions.php";

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

$filenameConversations = __DIR__."/conversations.json";
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
        require_once "register.php";
        register($requestData);
        break;
    case "login":
        require_once "login.php";
        login($requestData);
        break;
    case "feed":
        require_once "feed.php";
        feed($requestData);
        break;
    case "addFriend":
        require_once "addFriend.php";
        addFriend($requestData);
        break;
    case "chat":
        require_once "chat.php";
        chat($requestData, $users, $allConversations);
        break;
    case "shareMood":
        require_once "sharemood.php";
        shareMood();
        break;
    case "myProfile":
        require_once "myProfile.php";
        myProfile($requestData);
        break;
}


?>