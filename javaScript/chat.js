"use strict";

// Renders the chat page.
async function renderChatPage(){
    const mainDom = document.querySelector("main");

    mainDom.innerHTML = `
    <div id="chatUsername"></div>
    <div id="privateChats"></div>
    `

    const loggedInUserFriends = await fetchFriends();

    loggedInUserFriends.forEach(friendObject => {
        const privateChats = mainDom.querySelector("#privateChats");

        const friendDivDom = document.createElement("div");
        friendDivDom.textContent = friendObject.username;
        privateChats.appendChild(friendDivDom);

        friendDivDom.addEventListener("click", renderPrivateChat);
    });
}

// Render private chat when clicking on a friend in chat page.
async function renderPrivateChat(event){

    // The clicked friends username
    const currentFriendUsername = event.target.textContent;

    // Fetch messages from the current friend.
    await fetchMessages();

    const privateChat = document.createElement("div");
    privateChat.innerHTML = `
    <div id="top">
        <div>Username</div>
        <div id="closeChat">Close</div>
    </div>
    <div id="messages"></div>
    <div id="operations">
        <input>
        <button id="sendMessage">Send</button>
    </div>
    `

    // add event listener for the send message button
    privateChat.querySelector("#sendMessage").addEventListener("click", sendMessage);

    // add event listener to close current chat
    privateChat.querySelector("#closeChat").addEventListener("click", event => {
        privateChat.remove();
    })

    document.querySelector("main").appendChild(privateChat);

    async function sendMessage(event){
        // Function used to POST message to server.
    }

    // This function fetches all friends with fetchFriends() then prints the messages that are between the current friend and the user.
    async function fetchMessages(){
        // This function will be called every second with setTimeout()

        // Fetch friends
        const loggedInUserFriends = await fetchFriends();

        // Current friends object
        let currentFriend;
        
        // Find the object of the current friend and put in currentFriend variable.
        loggedInUserFriends.forEach(friendObject => {
            if(friendObject.username === currentFriendUsername){
                currentFriend = friendObject;
            }
        });

        const currentFriendsConversation = currentFriend.conversations[0];

        // Add so that each message is printed.
    }
}

// Fetches every user object that is friends with the currently logged in user.
async function fetchFriends(){
    // Get ID for the user that currently logged in.
    const loggedInUser = window.localStorage.getItem("userId");

    // Request with the logged in users ID as parameter.
    const request = new Request(`../php/chat.php?userID=${loggedInUser}`);
    const response = await fetch(request);
    const resource = await response.json();

    return await resource;
}