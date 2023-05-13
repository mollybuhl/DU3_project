"use strict";

/* 

TODO:
    - Comments
    - Classes/IDs
    - Variable names
    - CSS   
    - Fix error if two groupchats have same name
    - Small errors in code
    - Make code more readable, extract functions? Repeated code?
    - Error messages
    - Fetch feedback for user
*/

// Renders the chat page.
async function renderChatPage(){
    const user = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword");

    
    document.querySelector(".footerFeed > div > .postButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .feedButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .profileButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .chatButton").parentElement.classList.add("selected");


    const body = document.querySelector("body");
    body.removeAttribute("class");
    body.classList.add("bodyFeed");

    const header = document.querySelector("header");
    header.removeAttribute("class");
    header.classList.add("feedHeader");
    header.querySelector(".friendsButton").classList.add("hidden");
    header.querySelector(".profileInformation").removeAttribute("style");

    if(header.querySelector("#settingsButton")){
        header.querySelector("#settingsButton").remove();
    }
    
    

    const main = document.querySelector("main");
    main.removeAttribute("class");
    main.classList.add("chatMain");
    main.innerHTML = `
    <div class="backgroundImage"></div>
    <div id="chatsContainer">
        <div id="privateChats">
            <p>Chats with friends:</p>
            <div id="privateChatsContainer"></div>
        </div>
        <div id="groupChats">
            <div id="groupChatsTop">
                <p>Groupchats:</p>
                <div id="createGroupChat"></div>
            </div>
            <div id="groupChatsContainer"></div>
        </div>
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
        const privateChats = main.querySelector("#privateChatsContainer");

        const friendDivDom = document.createElement("div");
        friendDivDom.innerHTML = `
        <div class="iconStyle" style="background-image: url('${friendObject.profilePicture}');")></div>
        <div class="chatName">${friendObject.username}</div>
        `
        friendDivDom.querySelector(".chatName").addEventListener("click", event => event.stopPropagation());
        friendDivDom.querySelector(".iconStyle").addEventListener("click", event => event.stopPropagation());
        friendDivDom.classList.add("privateChat");
        privateChats.appendChild(friendDivDom);

        friendDivDom.addEventListener("click", renderChat);
    });

    // Create a <div> for each groupchat, if you click it, it will render a chat window.
    userGroupChats.forEach(groupChat => {
        const groupChats = main.querySelector("#groupChatsContainer");

        const groupChatDom = document.createElement("div");
        groupChatDom.innerHTML = `
        <div class="iconStyle groupIcon" style="background-image: url('media/groupIcon.png');")></div>
        <div class="chatName">${groupChat.name}</div>
        `
        groupChatDom.querySelector(".chatName").addEventListener("click", event => event.stopPropagation());
        groupChatDom.querySelector(".iconStyle").addEventListener("click", event => event.stopPropagation());
        groupChatDom.classList.add("groupChat");

        if(groupChat.ownerID === user){
            const ownerIcon = document.createElement("div");
            ownerIcon.addEventListener("click", event => event.stopPropagation());
            ownerIcon.classList.add("ownerIcon");
            groupChatDom.appendChild(ownerIcon);
        }

        groupChats.append(groupChatDom);
        
        groupChatDom.addEventListener("click", renderChat);
    });

    // Add eventListener to create group chat button.
    main.querySelector("#createGroupChat").addEventListener("click", createGroupChat);

    // This function renders a chat with the person or group that was clicked.
    async function renderChat(event){
        // Declaring chatID and type here to use it later when fetching chats.
        let chatID;
        let type;
        
        // If the clicked <div> was a private chat/friend chat, find which friend that was clicked then find the chat that is between the user and that friend, then store that chats ID in chatID. If it's the first time a chat was opened between the user and the friend, create a new chat between them.
        if(event.target.classList.contains("privateChat")){
            const target = event.target.querySelector(".chatName");
            type = "privateChat";
            const clickedFriendUsername = target.textContent;

            userFriends.forEach(friend => {
                if(friend.username === clickedFriendUsername){
                    userPrivateChats.forEach(chat => {
                        if(chat.betweenUsers.includes(friend.id)){
                            chatID = chat.id;
                        }
                    })
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
            const target = event.target.querySelector(".chatName");
            type = "groupChat";
            
            const clickedGroupChat = target.textContent;

            userGroupChats.forEach(groupChat => {
                if(clickedGroupChat === groupChat.name){
                    chatID = groupChat.id;
                }
            })

        }

        // Create the chatmodal that will be used to chat.
        const chatModal = document.createElement("div");
        document.querySelector("main").append(chatModal);
        chatModal.classList.add("chatPageModal")
        const chat = document.createElement("div");
        chat.innerHTML = `
        <div id="chatTop">
            <div>${event.target.textContent}</div>
            <div id="chatOptions">
                <div class="hidden" id="groupChatOptions"></div>
                <div class="closeModal" id="closeChat"></div>
            </div>
        </div>
        <div id="messages"></div>
        <div id="operations">
            <input id="messageText" placeholder="Write a message here">
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
            console.log(type);
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

            fetchAndPrintMessages(false, true);
        }

        async function fetchAndPrintMessages(startTimeout = true, calledFromSendMessage = false){
            let scrollToBottom;

            if(document.querySelector("#chat") === null){
                startTimeout = false;
                return;
            }
            
            const conversation = await fetchChatPhp(user, userPassword, "POST", {
                chatAction: "fetchChat",
                chatID: chatID,
                type: type
            }, false);
            const conversationMessages = await conversation.messages;

            conversationMessages.sort((a, b) => {
                if(a.id > b.id){
                    return 1;
                }else{
                    return -1;
                }
            });

            const messagesDiv = chat.querySelector("#messages");
            if(messagesDiv.scrollTop === messagesDiv.scrollTopMax || calledFromSendMessage){
                scrollToBottom = true;
            }

            messagesDiv.innerHTML = "";

            conversationMessages.forEach(message => {
                const messageDiv = document.createElement("div");
                messageDiv.classList.add("messageContainer");
                messageDiv.innerHTML = `
                <div class="messageInfo">
                    <div class="messageUsername">${message.sender}</div>
                    <div class="messageTimestamp">${message.timestamp}</div>
                </div>
                <div class="messageText">${message.text}</div>
                `;
                messagesDiv.appendChild(messageDiv);
            })

            if(scrollToBottom){
                messagesDiv.scrollTop = messagesDiv.scrollTopMax;
            }

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
            <div class="modalContainer">
                <div id="optionsTop">
                    <div>Chat Options</div>
                    <div class="closeModal" id="closeOptions"></div>
                </div>
                <span id="ownerOptions" class="hidden">
                    <button id="changeGroupName">Change Groupname</button>
                    <button id="changeMembers">Add/Remove members</button>
                </span>
                <button id="leaveDelete"></button>
            </div>
            `
            optionsDivDom.classList.add("chatPageModal");
            optionsDivDom.querySelector("#closeOptions").addEventListener("click", e => optionsDivDom.remove());

            if(user === ownerID){
                const ownerOptionsDom = optionsDivDom.querySelector("#ownerOptions");
                ownerOptionsDom.classList.remove("hidden");

                ownerOptionsDom.querySelector("#changeGroupName").addEventListener("click", event => {
                    const changeGroupNameDom = document.createElement("div");
                    changeGroupNameDom.innerHTML = `
                    <div class="modalContainer">
                        <label for="newGroupName">Enter a new group name</label>
                        <input name="newGroupName" id="newGroupName">
                        <div id="confirmCancel">
                            <button id="confirmNameChange">Confirm</button>
                            <button id="cancelNameChange">Cancel</button>
                        </div>
                    </div>
                    `
                    changeGroupNameDom.classList.add("chatPageModal");

                    changeGroupNameDom.querySelector("#confirmCancel > #cancelNameChange").addEventListener("click", event => changeGroupNameDom.remove());
                    changeGroupNameDom.querySelector("#confirmCancel > #confirmNameChange").addEventListener("click", event => {
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
                    <div class="modalContainer">
                        <div id="friendsSelector"></div>
                        <div id="confirmCancel">
                            <button id="confirmEditFriends">Confirm</button>
                            <button id="cancelEditFriends">Cancel</button>
                        </div>
                    </div>
                    `
                    addFriendsModal.classList.add("chatPageModal");

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
                    addFriendsModal.querySelector("#confirmCancel > #cancelEditFriends").addEventListener("click", e => addFriendsModal.remove());
                    addFriendsModal.querySelector("#confirmCancel > #confirmEditFriends").addEventListener("click", async function(){
                            await fetchChatPhp(user, userPassword, "PATCH", {
                                chatAction: "editMembers",
                                chatID: chatID,
                                betweenUsers: betweenUsers
                            });
                            addFriendsModal.remove();
                        })
                    optionsDivDom.appendChild(addFriendsModal);
                })

                const leaveDeleteButton = optionsDivDom.querySelector("#leaveDelete")
                leaveDeleteButton.textContent = "Delete groupchat";
                leaveDeleteButton.addEventListener("click", event => {

                    const confirmationModal = document.createElement("div");
                    confirmationModal.innerHTML = `
                    <div class="modalContainer">
                        <div>Are you sure you want to delete this groupchat?</div>
                        <div id="confirmCancel">
                            <button id="confirmDeleteGroup">Confirm</button>
                            <button id="cancelDeleteGroup">Cancel</button>
                        </div>
                    </div>
                    `
                    confirmationModal.classList.add("chatPageModal");

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
                    <div class="modalContainer">
                        <div>Are you sure you want to leave this groupchat?</div>
                        <div id="confirmCancel">
                            <button id="confirmDeleteGroup">Confirm</button>
                            <button id="cancelDeleteGroup">Cancel</button>
                        </div>
                    </div>
                    `
                    confirmationModal.classList.add("chatPageModal");

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

        const chatMessages = chat.querySelector("#messages")
        chatMessages.scrollTop = chatMessages.scrollTopMax;
    }

    async function createGroupChat(event){
        const groupChatModal = document.createElement("div");
        let betweenUsers = [user];

        groupChatModal.innerHTML = `
        <div class="modalContainer">
            <div id="createGroupTop">
                <div>Creating a new groupchat...</div>
                <div id="closeModal">Close</div>
            </div>

            <label for="groupName">Name:</label>
            <input type="text" name="groupName" id="groupName">
            <button id="addFriendsToChat">Choose friends to add</button>
            <button id="finalizeGroupChat">Create Groupchat!</button>
        </div>
        `
        groupChatModal.classList.add("chatPageModal");

        groupChatModal.querySelector("#closeModal").addEventListener("click", event => groupChatModal.remove())

        groupChatModal.querySelector("#addFriendsToChat").addEventListener("click", event => {
            const addFriendsModal = document.createElement("div");
            addFriendsModal.innerHTML = `
            <div class="modalContainer">
                <div id="friendsSelector"></div>
                <button id="confirmFriends">Update members</button>
            </div>
            `
            addFriendsModal.classList.add("chatPageModal");

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

        main.appendChild(groupChatModal);
    }
}

async function fetchFriends(userID, userPassword){
    const GETstring = `userID=${userID}&userPassword=${userPassword}&action=chat`
    const response = await fetchAPI(true, GETstring);
    const resource = await chatResponseHandler(response);

    return await resource;
}

async function fetchChatPhp(user, userPassword, method, specificInfo, fetchModal = true){
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

    const response = await fetchAPI(false, requestOptions, fetchModal);
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