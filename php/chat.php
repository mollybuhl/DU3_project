<?php
require_once "functions.php";

$requestMethod = $_SERVER["REQUEST_METHOD"];
$allowed = ["POST", "GET"];
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

if($requestMethod == "GET"){
    // Get the logged in userID from the parameter sent with GET request.
    $userID = $_GET["userID"];
    $loggedInUser = "";

    // Find the logged in user in users array.
    foreach($users as $user){
        if($user["id"] == $userID){
            $loggedInUser = $user;
        }
    }

    $usersFriendsWithUser = [];

    // Find all users that is friends with the logged in user.
    foreach($users as $user){
        if(in_array($user["id"], $loggedInUser["friends"])){
            unset($user["password"]);
            $usersFriendsWithUser[] = $user;
        }
    }

    // Remove messages from every friends privateMessages that are not between the user and the users friend.
    foreach($usersFriendsWithUser as $userFriend){
        $userFriendPrivateMessages = $userFriend["privateMessages"];

        foreach($userFriendPrivateMessages as $index => $message){
            if($message["toUser"] != $userID and $message["fromUser"] != $userID){
                unset($userFriend["privateMessages"][$index]);
            }
        }
    }

    sendJSON($usersFriendsWithUser, 200);
}
if($requestMethod == "POST"){

    $requestJSON = file_get_contents("php://input");
    $requestData = json_decode($requestJSON, true);

}
?>