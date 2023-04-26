<?php
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
    
}
if($requestMethod == "POST"){

}
?>