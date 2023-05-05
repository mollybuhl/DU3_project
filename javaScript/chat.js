"use strict";

// Renders the chat page.
async function renderChatPage(){
    // Select the <main> element and change its innerHTML.
    const mainDom = document.querySelector("main");
    mainDom.innerHTML = `
    <div id="privateChats"></div>
    <div id="groupChats"></div>
    `;

    // Fetch the users friends, then create a new <div> for each friend and put their username as textContent for the <div>, also add an eventListener for every <div>, when its pressed call function renderPrivateChat().
    const userFriends = await fetchFriends();
    const userGroupChats = await fetchChats("groupChat");
    const userPrivateChats = await fetchChats("privateChat");
    console.log(userPrivateChats);
    userFriends.forEach(friendObject => {
        const privateChats = mainDom.querySelector("#privateChats");

        const friendDivDom = document.createElement("div");
        friendDivDom.textContent = friendObject.username;
        friendDivDom.classList.add("privateChat");
        privateChats.appendChild(friendDivDom);

        friendDivDom.addEventListener("click", renderChat);
    });

    userGroupChats.forEach(groupChat => {
        const groupChats = mainDom.querySelector("#groupChats");

        const groupChatDom = document.createElement("div");
        groupChatDom.textContent = groupChat.name;
        groupChatDom.classList.add("groupChat");
        groupChats.append(groupChatDom);
        

        groupChatDom.addEventListener("click", renderChat);
    })

    // This function renders a private chat between the user and its friend.
    async function renderChat(event){
        let chatID;
        let type;

        if(event.target.classList.contains("privateChat")){
            const clickedFriendUsername = event.target.textContent;

            userFriends.forEach(friend => {
                if(friend.username === clickedFriendUsername){
                    userPrivateChats.forEach(privateChat => {
                        if(privateChat.betweenUsers.includes(friend.id)){
                            chatID = privateChat.id;
                            type = "privateChat";
                        }
                    })
                }
            });

        }
        if(event.target.classList.contains("groupChat")){
            const clickedGroupChat = event.target.textContent;

            userGroupChats.forEach(groupChat => {
                if(clickedGroupChat === groupChat.name){
                    chatID = groupChat.id;
                    type = "groupChat";
                }
            })

        }
        
        // Create a <div> and fill will elements building the private chat window. Then set an id to the <div> also append it to <main>.
        const chatModal = document.createElement("div");
        document.querySelector("main").append(chatModal);
        chatModal.setAttribute("id", "chatModal")
        const privateChat = document.createElement("div");
        privateChat.innerHTML = `
        <div id="top">
            <div>${event.target.textContent}</div>
            <div id="closeChat">Close</div>
        </div>
        <div id="messages"></div>
        <div id="operations">
            <input>
            <button id="sendMessage">Send</button>
        </div>
        `
        privateChat.setAttribute("id", "privateChat");
        chatModal.appendChild(privateChat);

        // Add event listener for the send message button.
        privateChat.querySelector("#sendMessage").addEventListener("click", sendMessage);

        // Add event listener to close current chat.
        privateChat.querySelector("#closeChat").addEventListener("click", event => chatModal.remove())

        // Calling the function to start fetch messages and print them.
        await fetchAndPrintMessages();

        // This function will trigger when the send message button is pressed within the privateChat <div>. It posts a new message to the server.
        async function sendMessage(event){

            const date = new Date();
            const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
            let timestamp = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${months[date.getMonth()]}`

            // Get the message the user wants to send.
            const message = privateChat.querySelector("#operations > input").value;

            // The body of the request
            const requestOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: "postMessage",
                    type: type,
                    chatID: chatID,
                    message: {
                        text: message,
                        timestamp: timestamp
                    }
                })
            }

            // Send message to server.
            const request = new Request("../php/chat.php", requestOptions);
            const response = await fetch(request);

            // Fetch the messages once your message is up on the server to instantly see your own message. The argument is sent to make it non-recursive.
            fetchAndPrintMessages(false);
        }

        // This function fetches all messages from the conversation between the user and the friend and prints them into the messages <div> in the privateChat <div>, this function is by default a recursive function, meaning once the function reaches the end, it will call itself again with one second delay. This is done to automatically receive new messages from the friend.
        async function fetchAndPrintMessages(startTimeout = true){

            // If the chat has been closed for any reason, make it non-recursive to prevent it from doing unnecessary fetches, then end the function with return.
            if(document.querySelector("main > #chatModal > #privateChat") === null){
                startTimeout = false;
                return;
            }

            // The options for the request made to fetch the messages.
            const requestOptions = {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    action: "fetchChat",
                    chatID: chatID,
                    type: type
                })
            }

            // Fetch messages.
            const request = new Request("../php/chat.php", requestOptions);
            const response = await fetch(request);
            const resource = await response.json();

            // Put fetched messages into an array.
            const conversationMessages = resource.messages;

            // Sort the array after message ID, so the message with the lowest id(the very first message sent in the convo) will be first.
            conversationMessages.sort((a, b) => {
                if(a.id > b.id){
                    return 1;
                }else{
                    return -1;
                }
            });

            // Select the <div> where the messages will be printed into, and clear it to prevent duplication of messages.
            const messagesDiv = privateChat.querySelector("#messages");
            messagesDiv.innerHTML = "";

            // For every message in the messages array, create a <div> and put the text message as textContent, then append to the messages <div>.
            conversationMessages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = message.text;
                messagesDiv.appendChild(messageDiv);
            })

            // if startTimeout = true, call this function again after one second, making it recursive.
            if(startTimeout){
                setTimeout(fetchAndPrintMessages, 1000);
            }
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

async function fetchChats(type){

    const loggedInUser = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword");

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "fetchChats",
            type: type,
            userID: loggedInUser,
            userPassword: userPassword
        })
    }

    const request = new Request("../php/chat.php", requestOptions);
    const response = await fetch(request);
    const resource = await response.json();
        
    return await resource;


}