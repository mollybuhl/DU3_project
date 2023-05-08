"use strict";

/* 

TODO:
    - Add/remove users from groupchat
    - Leave/remove groupchat (leave if non owner, remove if owner)
    - Fix error if two groupchats have same name
    - Small errors in code
    - CSS
    - Classes/IDs
    - Variable names
    - Comments
    - Error messages
    - Fetch feedback for user
*/

// Renders the chat page.
async function renderChatPage(){
    const user = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword")

    // Select the <main> element and change its innerHTML.
    const mainDom = document.querySelector("main");
    mainDom.innerHTML = `
    <div id="privateChats"></div>
    <div id="groupChats">
        <button id="createGroupChat">Create new groupchat</button>
    </div>
    `;

    const userFriends = await fetchFriends(user, userPassword, "chat");
    const userGroupChats = await fetchChats(user, userPassword, "groupChat");
    let userPrivateChats = await fetchChats(user, userPassword, "privateChat");

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
    });

    mainDom.querySelector("#groupChats > #createGroupChat").addEventListener("click", createGroupChat);

    async function renderChat(event){
        let chatID;
        let type;
        
        if(event.target.classList.contains("privateChat")){
            type = "privateChat";
            
            const clickedFriendUsername = event.target.textContent;

            let friendObject;
            userFriends.forEach(friend => {
                if(friend.username === clickedFriendUsername){
                    userPrivateChats.forEach(privateChat => {
                        if(privateChat.betweenUsers.includes(friend.id)){
                            chatID = privateChat.id;
                        }
                    })
                    friendObject = friend;
                }
            });

            if(chatID === undefined){
                createdChat = await createPrivateChat(user, userPassword, friendObject.id);
                chatID = createdChat.id;
                userPrivateChats = await fetchChats(user, userPassword, "privateChat");
            }
        }

        if(event.target.classList.contains("groupChat")){
            type = "groupChat";
            
            const clickedGroupChat = event.target.textContent;

            userGroupChats.forEach(groupChat => {
                if(clickedGroupChat === groupChat.name){
                    chatID = groupChat.id;
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
            <div id="chatOptions">
                <div class="hidden" id="groupChatOptions">Options</div>
                <div id="closeChat">Close</div>
            </div>
        </div>
        <div id="messages"></div>
        <div id="operations">
            <input>
            <button id="sendMessage">Send</button>
        </div>
        `
        privateChat.setAttribute("id", "privateChat");
        chatModal.appendChild(privateChat);

        if(type === "groupChat"){
            privateChat.querySelector("#groupChatOptions").classList.remove("hidden");
            privateChat.querySelector("#groupChatOptions").addEventListener("click", renderGroupChatOptions);
        }
        // Add event listener for the send message button.
        privateChat.querySelector("#sendMessage").addEventListener("click", sendMessage);

        // Add event listener to close current chat.
        privateChat.querySelector("#closeChat").addEventListener("click", event => chatModal.remove())

        // Calling the function to start fetch messages and print them.
        await fetchAndPrintMessages();

        async function sendMessage(event){
            // Get the message the user wants to send.
            const message = privateChat.querySelector("#operations > input").value;

            await postMessageToChat(user, userPassword, type, chatID, message);

            // Fetch the messages once your message is up on the server to instantly see your own message. The argument is sent to make it non-recursive.
            fetchAndPrintMessages(false);
        }

        async function fetchAndPrintMessages(startTimeout = true){

            // If the chat has been closed for any reason, make it non-recursive to prevent it from doing unnecessary fetches, then end the function with return.
            if(document.querySelector("main > #chatModal > #privateChat") === null){
                startTimeout = false;
                return;
            }

            // Put fetched messages into an array.
            const conversation = await fetchOneChat(user, userPassword, chatID, type);
            const conversationMessages = await conversation.messages;

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

        async function renderGroupChatOptions(event){
            const conversation = await fetchOneChat(user, userPassword, chatID, type);

            let betweenUsers = conversation.betweenUsers;
            let ownerID = conversation.ownerID;
            let name = conversation.name;

            const optionsDivDom = document.createElement("div");
            optionsDivDom.innerHTML = `
            <div>
                <div id="optionsTop">
                    <div>Options</div>
                    <div>Close</div>
                </div>
                <span id="ownerOptions" class="hidden">
                    <button id="changeGroupName">Change Groupname</button>
                    <button id="changeMembers">Add/Remove members</button>
                </span>
                <button id="leaveDelete"></button>
            </div>
            `

            if(user === ownerID){
                const ownerOptionsDom = optionsDivDom.querySelector("#ownerOptions");
                ownerOptionsDom.classList.remove("hidden");

                ownerOptionsDom.querySelector("#changeGroupName").addEventListener("click", event => {
                    const changeGroupNameDom = document.createElement("div");
                    changeGroupNameDom.innerHTML = `
                    <label for="newGroupName">Enter a new group name</label>
                    <input name="newGroupName" id="newGroupName">
                    <button id="confirmNameChange">Confirm</button>
                    `

                    changeGroupNameDom.querySelector("#confirmNameChange").addEventListener("click", event => {
                        name = changeGroupNameDom.querySelector("#newGroupName").value;
                        changeGroupName(user, userPassword, name, chatID);
                    })
                    optionsDivDom.appendChild(changeGroupNameDom);
                })

                ownerOptionsDom.querySelector("#changeMembers").addEventListener("click", event => {
                    const addFriendsModal = document.createElement("div");

                    addFriendsModal.innerHTML = `
                    <div id="friendsSelector"></div>
                    <button id="friends">Confirm</button>
                    `
        
                    userFriends.forEach(friend => {
                        const friendDiv = document.createElement("div");
                        friendDiv.innerHTML = `
                        <div id="profPic"></div>
                        <div id="friendName">${friend.username}</div>
                        `
                        
                        if(betweenUsers.includes(friend.id)){
                            friendDiv.classList.add("marked");
                        }

                        friendDiv.addEventListener("click", event => {
                            if(!betweenUsers.includes(friend.id)){
                                betweenUsers.push(friend.id);
                                friendDiv.classList.add("marked");
                            }else{
                                betweenUsers.splice(betweenUsers.indexOf(friend.id), 1);
                                friendDiv.classList.remove("marked");
                            }
                        })
                        addFriendsModal.querySelector("#friendsSelector").appendChild(friendDiv);
                    })
                    addFriendsModal.querySelector("#friends").addEventListener("click", async function(){
                            await changeGroupMembers(user, userPassword, chatID, betweenUsers);
                            addFriendsModal.remove();
                        })
                    ownerOptionsDom.appendChild(addFriendsModal);
                })

                const leaveDeleteButton = optionsDivDom.querySelector("#leaveDelete")
                leaveDeleteButton.textContent = "Delete groupchat";
                leaveDeleteButton.addEventListener("click", event => {

                    const confirmationModal = document.createElement("div");
                    confirmationModal.innerHTML = `
                    <div>Are you sure you want to delete this groupchat?</div>
                    <div id="deleteGroupConfirmation">
                        <button id="confirmDeleteGroup">Confirm</button>
                        <button id="cancelDeleteGroup">Cancel</button>
                    </div>
                    `

                    confirmationModal.querySelector("#cancelDeleteGroup").addEventListener("click", event => confirmationModal.remove());
                    confirmationModal.querySelector("#confirmDeleteGroup").addEventListener("click", async function(){
                            await deleteGroupChat(user, userPassword, chatID);
                            confirmationModal.remove();
                            renderChatPage();
                        });

                    ownerOptionsDom.appendChild(confirmationModal);
                })
            }
            if(user !== ownerID){
                const leaveDeleteButton = optionsDivDom.querySelector("#leaveDelete");
                leaveDeleteButton.textContent = "Leave groupchat";
                leaveDeleteButton.addEventListener("click", async function(){

                    const confirmationModal = document.createElement("div");
                    confirmationModal.innerHTML = `
                    <div>Are you sure you want to leave this groupchat?</div>
                    <div id="deleteGroupConfirmation">
                        <button id="confirmDeleteGroup">Confirm</button>
                        <button id="cancelDeleteGroup">Cancel</button>
                    </div>
                    `

                    confirmationModal.querySelector("#cancelDeleteGroup").addEventListener("click", event => confirmationModal.remove());
                    confirmationModal.querySelector("#confirmDeleteGroup").addEventListener("click", async function(){
                        await leaveGroupChat(user, userPassword, chatID);
                        confirmationModal.remove();
                    });
                })
            }
            privateChat.appendChild(optionsDivDom);
        }
    }

    async function createGroupChat(event){
        const groupChatModal = document.createElement("div");
        let betweenUsers = [user];

        groupChatModal.innerHTML = `
        <div>
            <div id="top">
                <div>Creating a new groupchat...</div>
                <div id="closeModal">Close</div>
            </div>

            <label for="groupName">Name:</label>
            <input type="text" name="groupName" id="groupName">
            <button id="addFriendsToChat">Choose friends to add</button>
            <button id="finalizeGroupChat">Create Groupchat!</button>
        </div>
        `
        groupChatModal.classList.add("modal");

        groupChatModal.querySelector("#closeModal").addEventListener("click", event => groupChatModal.remove())

        groupChatModal.querySelector("#addFriendsToChat").addEventListener("click", event => {
            const addFriendsModal = document.createElement("div");
            addFriendsModal.innerHTML = `
            <div id="friendsSelector"></div>
            <button id="confirmFriends">Confirm</button>
            `

            userFriends.forEach(friend => {
                const friendDiv = document.createElement("div");
                friendDiv.innerHTML = `
                <div id="profPic"></div>
                <div id="friendName">${friend.username}</div>
                `
                
                friendDiv.addEventListener("click", event => {
                    if(!betweenUsers.includes(friend.id)){
                        betweenUsers.push(friend.id);
                        friendDiv.classList.add("marked");
                    }else{
                        betweenUsers.splice(betweenUsers.indexOf(friend.id));
                        friendDiv.classList.remove("marked");
                    }
                })
                addFriendsModal.querySelector("#friendsSelector").appendChild(friendDiv);
            })
            addFriendsModal.querySelector("#confirmFriends").addEventListener("click", event => addFriendsModal.remove())

            groupChatModal.appendChild(addFriendsModal);
        })

        groupChatModal.querySelector("#finalizeGroupChat").addEventListener("click", async function(){
            const chatName = document.querySelector("#groupName").value;
            await finalizeGroupChat(user, userPassword, chatName, betweenUsers);
            renderChatPage();
        })

        mainDom.appendChild(groupChatModal);
    }
}

async function fetchFriends(userID, userPassword){
    const request = new Request(`php/api.php?userID=${userID}&userPassword=${userPassword}&action=chat`);
    const resource = await fetchAPI(request);

    return await resource;
}

async function fetchOneChat(userID, userPassword, chatID, type){
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "fetchChat",
            userID: userID,
            userPassword: userPassword,
            chatID: chatID,
            type: type
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function fetchChats(userID, userPassword, type){

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "fetchChats",
            userID: userID,
            userPassword: userPassword,
            type: type
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);
        
    return await resource;

}

async function createPrivateChat(userID, userPassword, friendID){
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "createPrivateChat",
            userID: userID,
            userPassword: userPassword,
            betweenUsers: [userID, friendID]
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function changeGroupName(userID, userPassword, chatName, chatID){
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "changeGroupName",
            userID: userID,
            userPassword: userPassword,
            chatName: chatName,
            chatID: chatID
        }) 
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function finalizeGroupChat(userID, userPassword, chatName, betweenUsers){
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "createGroupChat",
            userID: userID,
            userPassword: userPassword,
            chatName: chatName,
            betweenUsers: betweenUsers
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function leaveGroupChat(userID, userPassword, chatID){
    const requestOptions = {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "leaveGroup",
            userID: userID,
            userPassword: userPassword,
            chatID: chatID
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function deleteGroupChat(userID, userPassword, chatID){
    const requestOptions = {
        method: "DELETE",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "deleteGroup",
            userID: userID,
            userPassword: userPassword,
            chatID: chatID
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function changeGroupMembers(userID, userPassword, chatID, betweenUsers){
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "editMembers",
            userID: userID,
            userPassword: userPassword,
            chatID: chatID,
            betweenUsers: betweenUsers
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetchAPI(request);

    return await resource;
}

async function postMessageToChat(userID, userPassword, type, chatID, message){
    const date = new Date();
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    let timestamp = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${months[date.getMonth()]}`


    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "chat",
            chatAction: "postMessage",
            userID: userID,
            userPassword: userPassword,
            type: type,
            chatID: chatID,
            message: {
                sender: userID,
                text: message,
                timestamp: timestamp
            }
        })
    }

    const request = new Request("php/api.php", requestOptions);
    const resource = await fetch(request);
}