<?php

function shareMood($data, $users){
    require_once "functions.php";

    // Get the method used for the request, then check to see if it's allowed with a custom funciton (checkMethod).
    $requestMethod = $_SERVER["REQUEST_METHOD"];
    $allowed = ["POST"];
    checkMethod($requestMethod, $allowed);
    
    $userID = $data["userID"];
    $mood = $data["mood"];
    $description = $data["description"];
    $quote = $data["quote"];
    $timestamp = $data["timestamp"];
    $dayOfWeek = $data["dayOfWeek"];
    
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
            putInUsersJSON($users);
            sendJSON($newPost, 200);
        }
    }
}
?>