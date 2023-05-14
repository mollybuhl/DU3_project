"use strict";

/* 

TODO:
    - Comments
    - Classes/IDs
    - Variable names
    - CSS   
    - Fix error if two groupchats have same name
    - Small errors in code
    - Make code more readable, destructure functions? Repeated code?
    - Error messages
    - Fetch feedback for user
*/

// Renders the chat page.
async function renderChatPage(){
    const user = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword")

    // remove classes and add new ones to body, header and main for CSS
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

    // Change main innerHTML
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
                <div id="addGroupChat"></div>
            </div>
            <div id="groupChatsContainer"></div>
        </div>
    </div>
    `;

    // Fetch the users friends, private chats with friends and groupchats
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
    main.querySelector("#addGroupChat").addEventListener("click", createGroupChat);

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

            let friendObject
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
                    betweenUsers: [user, friendObject.id]
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
        chatModal.classList.add("chatPageModal");
        const chat = document.createElement("div");
        chat.innerHTML = `
        <div id="chatTop">
            <div id="chatName">${event.target.textContent}</div>
            <div id="chatTopOptions">
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

        // Add eventListeners to send message and close the chat
        chat.querySelector("#sendMessage").addEventListener("click", sendMessage);
        chat.querySelector("#closeChat").addEventListener("click", event => chatModal.remove())

        // fetch current chat with chatID and print them to the <div> with id #messages
        await fetchAndPrintMessages();

        // This function generates a timestamp and posts the message written in the input field to the server.
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

            // When a message is sent, update the messages to see your own message instantly.
            fetchAndPrintMessages(false, true);
        }

        // This function fetches all messages from the current chat and prints them to the chat. If the parameter startTimeout is true (true by default) then set a timeout, after 1 second this function will be called again. Also if the user is scrolled all the way down in the chat or this function was fetched from sendMessage, keep the user scrolled down.
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
                <div class="messageProfPic" style="background-image: url('${message.profilePicture}');"></div>
                <div class="messageBody">
                    <div class="messageInfo">
                        <div class="messageUsername">${message.sender}</div>
                        <div class="messageTimestamp">${message.timestamp}</div>
                    </div>
                    <div class="messageText">${message.text}</div>
                </div>
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

        // This function renders the group options for the current chat, first fetch the groupchat again to fetch latest information about the chat.
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
                <div class="closeModal" id="closeOptions"></div>
                <div id="optionsTitle">Chat Options</div>
                
                <span id="ownerOptions" class="hidden">
                    <button id="changeGroupName">Change Groupname</button>
                    <button id="changeMembers">Add/Remove members</button>
                </span>
                <button id="leaveDelete"></button>
            </div>
            `
            optionsDivDom.classList.add("chatPageModal", "chatOptions");
            optionsDivDom.querySelector("#closeOptions").addEventListener("click", e => optionsDivDom.remove());

            // If the user is the owner of the chat, remove hidden from the buttons to change groupname and change members and add eventlisteners to them. Also make the last button be a delete button to delete the chat. The owner cannot leave the chat, it must delete it.
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
                    changeGroupNameDom.querySelector("#confirmCancel > #confirmNameChange").addEventListener("click", async function(){
                        name = changeGroupNameDom.querySelector("#newGroupName").value;
                        const newName = await fetchChatPhp(user, userPassword, "PATCH", {
                            chatAction: "changeGroupName",
                            name: name,
                            chatID: chatID
                        });
                        chat.querySelector("#chatName").textContent = newName;
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
                        <div class="profPic" style="background-image: url('${friend.profilePicture}');"></div>
                        <div id="friendName">${friend.username}</div>
                        `
                        
                        friendDiv.classList.add("friendDiv");

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

            // If the user is not the owner of the chat, only show the leave groupchat button.
            if(user !== ownerID){
                optionsDivDom.querySelector("#ownerOptions").remove();

                const leaveDeleteButton = optionsDivDom.querySelector("#leaveDelete");
                leaveDeleteButton.textContent = "Leave groupchat";
                leaveDeleteButton.addEventListener("click", async function(){
                    console.log("hej");
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

                    optionsDivDom.appendChild(confirmationModal);
                })
            }
            chat.appendChild(optionsDivDom);
        }

        // Render the chat with the scrollbar scrolled all the way down.
        const chatMessages = chat.querySelector("#messages")
        chatMessages.scrollTop = chatMessages.scrollTopMax;
    }

    // This function creates a groupchat and posts it to the server.
    async function createGroupChat(event){
        let betweenUsers = [user];
        const groupChatModal = document.createElement("div");
        
        groupChatModal.innerHTML = `
        <div class="modalContainer" id="createGroupChat">
            <div class="closeModal"></div>
            <div id="createGroupChatTitle">Creating groupchat</div>

            <label for="groupName" id="groupNameLabel">Name:</label>
            <input type="text" name="groupName" id="groupName" placeholder="Max 12 character">
            <button id="addFriendsToChat">Select members</button>
            <button id="finalizeGroupChat">Create Groupchat!</button>
        </div>
        `
        groupChatModal.classList.add("chatPageModal");

        groupChatModal.querySelector(".closeModal").addEventListener("click", event => groupChatModal.remove())

        // Add eventlistener to render a modal to add friends to the chat.
        groupChatModal.querySelector("#addFriendsToChat").addEventListener("click", event => {
            const addFriendsModal = document.createElement("div");
            addFriendsModal.innerHTML = `
            <div class="modalContainer">
                <div id="friendsSelector"></div>
                <button id="confirmFriends">Confirm</button>
            </div>
            `
            if(userFriends.length === 0){
                addFriendsModal.querySelector("#friendsSelector").textContent = "Add some friends to add them to your groupchat!"
            }
            addFriendsModal.classList.add("chatPageModal");

            userFriends.forEach(friend => {
                const friendDiv = document.createElement("div");
                friendDiv.innerHTML = `
                <div class="profPic" style="background-image: url('${friend.profilePicture}');"></div>
                <div id="friendName">${friend.username}</div>
                `
                friendDiv.classList.add("friendDiv");

                if(betweenUsers.includes(friend.id)){
                    friendDiv.classList.add("marked");
                }

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

        // Post the new chat to the server and render the chat page again to see the new groupchat.
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

// Fetches all friends of the user with the given userID.
async function fetchFriends(userID, userPassword){
    const GETstring = `userID=${userID}&userPassword=${userPassword}&action=chat`
    const response = await fetchAPI(true, GETstring);
    const resource = await chatResponseHandler(response);

    return await resource;
}

// Function to make a request to the server with any requestbody. There is a premade requestbody that will be combined with the object sent as the variable specificInfo to later use that combined object for the fetch.
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

// This function handles responses, might delete later.
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