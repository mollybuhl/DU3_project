"use strict";

/* 

TODO:
    - Fix error if two groupchats have same name
    - Small errors in code
    - Make code more readable, extract functions? Repeated code?
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

    const mainDom = document.querySelector("main");
    mainDom.innerHTML = `
    <div id="privateChats"></div>
    <div id="groupChats">
        <button id="createGroupChat">Create new groupchat</button>
    </div>
    `;

    // Fetch users friends, private chats with friends and groupchats
    const userFriends = await fetchFriends(user, userPassword);
    const userGroupChats = await fetchChatPhp(user, userPassword, "POST", {
        chatAction: "fetchChats",
        type: "groupChat"
    });
    let userPrivateChats = await fetchChatPhp(user, userPassword, "POST", {
        chatAction: "fetchChats",
        type: "privateChat"
    });

    // Create a <div> for each friend, if you click it, it will render a chat window.
    userFriends.forEach(friendObject => {
        const privateChats = mainDom.querySelector("#privateChats");

        const friendDivDom = document.createElement("div");
        friendDivDom.textContent = friendObject.username;
        friendDivDom.classList.add("chat");
        privateChats.appendChild(friendDivDom);

        friendDivDom.addEventListener("click", renderChat);
    });

    // Create a <div> for each groupchat, if you click it, it will render a chat window.
    userGroupChats.forEach(groupChat => {
        const groupChats = mainDom.querySelector("#groupChats");

        const groupChatDom = document.createElement("div");
        groupChatDom.textContent = groupChat.name;
        groupChatDom.classList.add("groupChat");
        groupChats.append(groupChatDom);
        

        groupChatDom.addEventListener("click", renderChat);
    });

    // Add eventListener to create group chat button.
    mainDom.querySelector("#groupChats > #createGroupChat").addEventListener("click", createGroupChat);

    // This function renders a chat with the person or group that was clicked.
    async function renderChat(event){
        // Declaring chatID and type here to use it later when fetching chats.
        let chatID;
        let type;
        
        // If the clicked <div> was a private chat/friend chat, find which friend that was clicked then find the chat that is between the user and that friend, then store that chats ID in chatID. If it's the first time a chat was opened between the user and the friend, create a new chat between them.
        if(event.target.classList.contains("chat")){
            type = "privateChat";
            
            const clickedFriendUsername = event.target.textContent;

            let friendObject;
            userFriends.forEach(friend => {
                if(friend.username === clickedFriendUsername){
                    userPrivateChats.forEach(chat => {
                        if(chat.betweenUsers.includes(friend.id)){
                            chatID = chat.id;
                        }
                    })
                    friendObject = friend;
                }
            });

            // If chatID still is undefined, meaning no chat was found between the user and the friend, create a new one between them. Store the new chats ID in chatID and refetch the private chats.
            if(chatID === undefined){
                const createdChat = await fetchChatPhp(user, userPassword, "POST", {
                    chatAction: "createPrivateChat",
                    betweenUsers: [user, friend.id]
                });
                chatID = createdChat.id;
                userPrivateChats = await fetchChatPhp(user, userPassword, "POST",{
                    chatAction: "fetchChats",
                    type: type
                });
            }
        }

        // If the clicked <div> was a groupchat, find which groupchat was clicked then store that groupchats ID in chatID.
        if(event.target.classList.contains("groupChat")){
            type = "groupChat";
            
            const clickedGroupChat = event.target.textContent;

            userGroupChats.forEach(groupChat => {
                if(clickedGroupChat === groupChat.name){
                    chatID = groupChat.id;
                }
            })

        }

        // Create the chatmodal that will be used to chat.
        const chatModal = document.createElement("div");
        document.querySelector("main").append(chatModal);
        chatModal.setAttribute("id", "chatModal")
        const chat = document.createElement("div");
        chat.innerHTML = `
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
        chat.setAttribute("id", "chat");
        chatModal.appendChild(chat);

        // If the clicked chat is a groupchat, add groupchat options button.
        if(type === "groupChat"){
            chat.querySelector("#groupChatOptions").classList.remove("hidden");
            chat.querySelector("#groupChatOptions").addEventListener("click", renderGroupChatOptions);
        }
        chat.querySelector("#sendMessage").addEventListener("click", sendMessage);
        chat.querySelector("#closeChat").addEventListener("click", event => chatModal.remove())

        // fetch current chat with chatID and print them to the <div> with id #messages
        await fetchAndPrintMessages();

        async function sendMessage(event){
            const message = chat.querySelector("#operations > input").value;

            const date = new Date();
            const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
            let timestamp = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${months[date.getMonth()]}`
        

            await fetchChatPhp(user, userPassword, "POST", {
                chatAction: "postMessage",
                type: type,
                chatID: chatID,
                message: {
                    sender: user,
                    text: message,
                    timestamp: timestamp
                }
            });

            fetchAndPrintMessages(false);
        }

        async function fetchAndPrintMessages(startTimeout = true){
            if(document.querySelector("main > #chatModal > #chat") === null){
                startTimeout = false;
                return;
            }

            const conversation = await fetchChatPhp(user, userPassword, "POST", {
                chatAction: "fetchChat",
                chatID: chatID,
                type: type
            });
            const conversationMessages = await conversation.messages;

            conversationMessages.sort((a, b) => {
                if(a.id > b.id){
                    return 1;
                }else{
                    return -1;
                }
            });

            const messagesDiv = chat.querySelector("#messages");
            messagesDiv.innerHTML = "";

            conversationMessages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = message.text;
                messagesDiv.appendChild(messageDiv);
            })

            if(startTimeout){
                setTimeout(fetchAndPrintMessages, 1000);
            }
        }

        async function renderGroupChatOptions(event){
            const conversation = await fetchChatPhp(user, userPassword, "POST", {
                chatAction: "fetchChat",
                chatID: chatID,
                type: type
            });

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
                        fetchChatPhp(user, userPassword, "PATCH", {
                            chatAction: "changeGroupName",
                            name: name,
                            chatID: chatID
                        });
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
                            await fetchChatPhp(user, userPassword, "PATCH", {
                                chatAction: "editMembers",
                                chatID: chatID,
                                betweenUsers: betweenUsers
                            });
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
                            await fetchChatPhp(user, userPassword, "DELETE", {
                                chatAction: "deleteGroup",
                                chatID: chatID
                            });
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
                        await fetchChatPhp(user, userPassword, "DELETE", {
                            chatAction: "leaveGroup",
                            chatID: chatID
                        });
                        confirmationModal.remove();
                    });
                })
            }
            chat.appendChild(optionsDivDom);
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
            await fetchChatPhp(user, userPassword, "POST", {
                chatAction: "createGroupChat",
                chatName: chatName,
                betweenUsers: betweenUsers
            });
            renderChatPage();
        })

        mainDom.appendChild(groupChatModal);
    }
}

async function fetchFriends(userID, userPassword){
    const GETstring = `userID=${userID}&userPassword=${userPassword}&action=chat`
    const response = await fetchAPI(true, GETstring);
    const resource = await chatResponseHandler(response);

    return await resource;
}

async function fetchChatPhp(user, userPassword, method, specificInfo){
    let requestBody = {
        action: "chat",
        userID: user,
        userPassword: userPassword
    }

    Object.assign(requestBody, specificInfo)

    const requestOptions = {
        method: method,
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(requestBody)
    }

    const response = await fetchAPI(false, requestOptions);
    const resource = await chatResponseHandler(response);

    return await resource;
}

async function chatResponseHandler(response){
    if(!response.ok){
        const message = await response.json().message;
        const errorModal = document.createElement("div");
        errorModal.innerHTML = `
        <div id="errorMessage">${message}</div>
        <button id="errorMessageButton">Close</div>
        `
        errorModal.querySelector("#errorMessageButton").addEventListener("click", event => errorModal.remove());

        const main = document.querySelector("main");
        main.appendChild(errorModal);
    }else{
        return await response.json();
    }
}