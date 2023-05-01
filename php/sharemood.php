<?php

/* 

The body structure when making a POST request to this file. 

{
    id: the ID of the user thats posting (int),
    mood: current mood (string),
    description: text describing why you are feeling this way (string),
    quote: the quote from the API (string)
}

EXAMPLE:
fetch("../php/sharemood.php", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
        id: 2,
        mood: "Happy",
        description: "Ice Cream!!!",
        quote: "Houston, we have a problem"
    })
})

*/

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
$requestData = json_decode(file_get_contents("php://input"), true);

$userID = $requestData["id"];
$mood = $requestData["mood"];
$description = $requestData["description"];
$quote = $requestData["quote"];
$timestamp = $requestData["timestamp"];
$dayOfWeek = $requestData["dayOfWeek"];

// Find the user with the same ID as in the one in the request.
foreach($users as $index => $user){
    if($user["id"] == $userID){

        // Find the post with the highest ID, used to give the new post a unique ID.
        $posts = $user["posts"];
        $highestID = 0;
        foreach($posts as $post){
            if($post["postID"] > $highestID){
                $highestID = $post["postID"];
            }
        }

        // New post as an associative array, add it to the users posts.
        $newPost = [
            "postID" => $highestID + 1,
            "userID" => $userID,
            "mood" => $mood,
            "description" => $description,
            "quote" => $quote,
            "dayOfWeek" => $dayOfWeek,
            "timestamp" => $timestamp
        ];

        $users[$index]["posts"][] = $newPost;

        // Encode $users and save it in $filename, then send the new post.
        file_put_contents($filename, json_encode($users, JSON_PRETTY_PRINT));

        sendJSON($newPost, 200);
    }
}

?>