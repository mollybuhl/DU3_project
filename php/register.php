<?php
require_once "functions.php";

// Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["POST"];
checkMethod($requestMethod, $allowed);

$filename = "php/users.json";
$users = [];

// Check if file exists. If it doesn't, save $users within $filename. If it exists get contents from $filename then decode and save it in $users.
if(!file_exists($filename)){
    $json = json_encode($users);
    file_put_contents($filename, $json);
}else{
    $json = file_get_contents($filename);
    $users = json_decode($json, true);
}

// Get contents from the request and save them in their respective variable.
$requestJSON = file_get_contents("php://input");
$requestData = json_decode($requestJSON, true);

$username = $requestData["username"];
$password = $requestData["password"];

// Check if the given username or password is shorter than 3 characters. If so, send a message with status 400(Bad request).
if(strlen($username) < 3 or strlen($password) < 3){
    $message = ["message" => "Both the username and password must be 3 characters or longer. Please try again."];
    sendJSON($message, 400); 
}

// Check if the given username is already used by another user. If so, send a message with status 409(Conflict).
foreach($users as $user){
    if($user["username"] == $username){
        $message = ["message" => "Sorry, that username is taken. Please try another"];
        sendJSON($message, 409);
    }
}

//Randomise profile image
$folder = "../media/profile_imgs";
$imageSources = scandir($folder);
$images = [];

foreach($imageSources as $imageSource){
    if(str_contains($imageSource, ".jpg")){
        array_push($images, $imageSource);
    }
}

$count = count($images);
$index = rand(0,($count - 1));

$profilePicture = $images[$index];

// Associative array of the newly created user that is added to the array $users.
$newUser = [
    "username" => $username,
    "password" => $password,
    "loggedFeelings" => [],
    "friends" => [],
    "friendRequests" => [],
    "posts" => [],
    "conversations" => [],
    "profilePicture" => "../media/profile_imgs/$profilePicture",
    "firstTime" => true
];

// Add unique ID to new user
$highestID = 0;
foreach($users as $user){
    if($user["id"] > $highestID){
        $highestID = $user["id"];
    }
}
$newUser["id"] = $highestID + 1;

$users[] = $newUser;

// Encode $users and save it in $filename, then send the username of the created user.
$json = json_encode($users, JSON_PRETTY_PRINT);
file_put_contents($filename, $json);

sendJSON($newUser["username"], 200);

?>