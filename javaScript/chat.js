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

    // The clicked friends username and JS object.
    const currentFriendUsername = event.target.textContent;
    let currentFriendObject;

    let fetchMessageTimeout;

    // Fetch the messages sent between the user and their friend.

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
    await fetchMessages();
    // add event listener for the send message button
    privateChat.querySelector("#sendMessage").addEventListener("click", event => {
        sendMessage();

    });

    // add event listener to close current chat
    privateChat.querySelector("#closeChat").addEventListener("click", event => {
        // Clear the timeout so it doesn't keep fetching messages when chat is closed.
        clearTimeout(fetchMessageTimeout);
        privateChat.remove();
    })

    document.querySelector("main").appendChild(privateChat);

    // This function will trigger when the send message button is pressed within the privateChat. Posts the message to the server.
    async function sendMessage(event){
        // Receiver is the friend of the user, sender is the user and message is the text that will be sent.
        const receiverID = currentFriendObject.id;
        const senderID = parseInt(window.localStorage.getItem("userId"));
        const message = privateChat.querySelector("#operations > input").value;

        // The body of the request
        const requestBody = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                senderID: senderID,
                receiverID: receiverID,
                message: {
                    timestamp: "",
                    text: message
                }
            })
        }

        // Send message to server.
        const request = new Request("../php/chat.php", requestBody);
        const response = await fetch(request);

        fetchMessages(false);
    }

    // This function fetches all friends with fetchFriends() then prints the messages that are between the current friend and the user.
    async function fetchMessages(startTimeout = true){
        // This function will be called every second with setTimeout()

        // Fetch friends
        const loggedInUserFriends = await fetchFriends();
        
        // Find the object of the current friend and put in currentFriend variable.
        loggedInUserFriends.forEach(friendObject => {
            if(friendObject.username === currentFriendUsername){
                currentFriendObject = friendObject;
            }
        });

        // Put current conversation in variable, then put every message in an array.
        const currentFriendsConversation = currentFriendObject.conversations[0];
        const conversationMessages = currentFriendsConversation.messages;

        // Sort the array after message ID, so the message with the lowest id(the very first message sent in the convo) will be first.
        conversationMessages.sort((a, b) => {
            if(a.id > b.id){
                return 1;
            }else{
                return -1;
            }
        });

        // The div that all messages will be put into.
        const messagesDiv = privateChat.querySelector("#messages");
        messagesDiv.innerHTML = "";

        // For every message in the messages array, create a div and put the text message as textContent, then append to the messagesDiv.
        conversationMessages.forEach(message => {
            const messageDiv = document.createElement("div");
            messageDiv.textContent = message.text;
            messagesDiv.appendChild(messageDiv);
        })

        // Call this function every second to repeatedly get messages.
        if(startTimeout){
            fetchMessageTimeout = setTimeout(fetchMessages, 1000);
        }
    }
}

// Fetches every user object that is friends with the currently logged in user.
async function fetchFriends(){
    // Get the currently logged in userID
    const loggedInUser = window.localStorage.getItem("userId");

    // Request with the logged in users ID as parameter.
    // This will return all friends that are in the friends list of the user with the sent ID.
    const request = new Request(`../php/chat.php?userID=${loggedInUser}`);
    const response = await fetch(request);
    const resource = await response.json();

    return await resource;
}