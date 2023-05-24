"use strict";

/*
TODO:
    - Classes/IDs
    - Variable names
    - CSS
    - Small errors in code
*/

// Renders the chat page.
async function renderChatPage(calledFromFeed = false, friendName){
    const user = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword");
    
    // Select Chat icon in Menu
    document.querySelector(".footerFeed > div > .postButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .feedButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .profileButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .chatButton").parentElement.classList.add("selected");


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
            <div class="chatName fontYsabeu">${friendObject.username}</div>
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
            <div data-chatid="${groupChat.id}" class="chatName">${groupChat.name}</div>
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
    main.querySelector("#addGroupChat").addEventListener("click", function(){
        createGroupChat(user, userPassword,userFriends);
    });


    // This function renders a chat with the person or group that was clicked.
    async function renderChat(event){

        // Declaring variables here to have access to them throughout the whole function.
        let chatID;
        let type;
        let chatName;
        let ownerID;
        let members;

        // If this was called from clicking a chat, find what type it was.
        if(event){
            if(event.target.classList.contains("privateChat")){
                type = "privateChat";
            }
            if(event.target.classList.contains("groupChat")){
                type = "groupChat";
            }
        }
    
        // If this function wasn't called from feed, get the name of the chat from the event.target.
        if(!calledFromFeed){
            const target = event.target.querySelector(".chatName");
            chatName = target.textContent;
        }
        // If called from feed, set the chatName to the name sent when calling the renderChatPage function, and set type to "privateChat" because it will always be a privateChat.
        if(calledFromFeed){
            chatName = friendName;
            type = "privateChat";
        }
        // If the chat is a private chat/friend chat, find which friend that was clicked then find the chat that is between the user and that friend, then store that chats ID in chatID. If it's the first time a chat was opened between the user and the friend, create a new chat between them.
        if(type === "privateChat"){
            let friendObject;
            userFriends.forEach(friend => {
                if(friend.username === chatName){
                    userPrivateChats.forEach(chat => {
                        if(chat.betweenUsers.includes(friend.id)){
                            chatID = chat.id;
                            members = chat.members;
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
                members = createdChat.members;
                userPrivateChats = await fetchChatPhp(user, userPassword, "POST",{
                    chatAction: "fetchChats",
                    type: type
                });
            }
        }

        // If the chat is a groupchat, find which groupchat was clicked then store that groupchats ID in chatID.
        if(type === "groupChat"){
            userGroupChats.forEach(groupChat => {
                const targetChatID = parseInt(event.target.querySelector(".chatName").dataset.chatid);
                if(chatName === groupChat.name && targetChatID === groupChat.id){
                    chatID = groupChat.id;
                    ownerID = groupChat.ownerID;
                    members = groupChat.members;
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
                <div id="chatName">${chatName}</div>
                <div id="chatTopOptions">
                    <div id="memberList"></div>
                    <div class="hidden" id="groupChatOptions"></div>
                    <div class="closeModal" id="closeChat"></div>
                </div>
            </div>
            <div id="messages"></div>
            <div id="operations">
                <textarea id="messageText" placeholder="Write a message here"></textarea>
                <button id="sendMessage">Send</button>
            </div>
        `
        chat.setAttribute("id", "chat");
        chatModal.appendChild(chat);

        // If the chat is a groupchat, add groupchat options button.
        if(type === "groupChat"){
            chat.querySelector("#groupChatOptions").classList.remove("hidden");
            chat.querySelector("#groupChatOptions").addEventListener("click", function(){
                renderGroupChatOptions(user, userPassword, chatID, type, userFriends);
            });
        }

        // Add eventListeners to send message.
        chat.querySelector("#sendMessage").addEventListener("click", function(){
            sendMessage(user, userPassword, type, ownerID, chatID);
        });
        // Add eventListener for the member list, once you click the icon to show all members in a chat, render a modal and display all members in the chat in the modal.
        chat.querySelector("#memberList").addEventListener("click", event => {
            const membersModal = document.createElement("div");
            membersModal.innerHTML = `
                <div class="modalContainer">
                    <div id="members"></div>
                    <button class="close">Close</button>
                </div>
            `
            membersModal.querySelector(".close").addEventListener("click", event => membersModal.remove());
            membersModal.classList.add("chatPageModal");

            members.forEach(member => {
                const memberDiv = document.createElement("div");
                memberDiv.innerHTML = `
                    <div class="profPic" style="background-image: url('${member.profilePicture}');"></div>
                    <div class="memberName">${member.username}</div>
                    <div class="ownerIcon hidden"></div>
                `
                memberDiv.classList.add("friendDiv");

                if(ownerID){
                    if(member.id == ownerID){
                        memberDiv.querySelector(".ownerIcon").classList.remove("hidden");
                    }
                }
                membersModal.querySelector("#members").appendChild(memberDiv);
            })
            chat.appendChild(membersModal);
        })
        // eventListener to close chat.
        chat.querySelector("#closeChat").addEventListener("click", event => {
            chatModal.remove();
            renderChatPage();
        })

        // fetch current chat with chatID and print them to the <div> with id messages
        await fetchAndPrintMessages(chatID, type, user, userPassword, ownerID);

        // Render the chat with the scrollbar scrolled all the way down.
        const chatMessages = chat.querySelector("#messages")
        chatMessages.scrollTop = chatMessages.scrollTopMax;
    }

    if(calledFromFeed){
        document.querySelector(".friendDisplay").classList.add("hidden");
        renderChat();
    }
}

// Generate a timestamp and send the message in the textarea element to the server with the timestamp.
async function sendMessage(user, userPassword, type, ownerID, chatID){
    const message = document.querySelector("#operations > textarea").value;

    if(message === ""){
        return;
    }

    const date = new Date();
    const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

    let hours = `${date.getHours()}`;
    let minutes = `${date.getMinutes()}`;
    if(hours.length === 1){
        hours = `0${date.getHours()}`;
    }
    if(minutes.length === 1){
        minutes = `0${date.getMinutes()}`;
    }
    let timestamp = `${hours}:${minutes}, ${date.getDate()} ${months[date.getMonth()]}`

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

    chat.querySelector("#messageText").value = "";
    // When a message is sent, update the messages to see your own message instantly.
    fetchAndPrintMessages(chatID, type, user, userPassword, ownerID, false, true);
}

// This function fetches all messages from the current chat and prints them to the chat. If the parameter startTimeout is true (true by default) then set a timeout, after 1 second this function will be called again. Also if the user is scrolled all the way down in the chat or this function was fetched from sendMessage, keep the user scrolled down.
async function fetchAndPrintMessages(chatID, type, user, userPassword, ownerID, startTimeout = true, calledFromSendMessage = false){
    // If the chat is closed, stop the function.
    if(!document.querySelector("#chat")){
        return;
    }

    let scrollToBottom;
    let timeout;

    // When you close the chat, clear the timeout so it doesn't keep fetching the chat.
    document.querySelector("#closeChat").addEventListener("click", event => clearTimeout(timeout));

    // Fetch the chat to get it's messages.
    const conversation = await fetchChatPhp(user, userPassword, "POST", {
        chatAction: "fetchChat",
        chatID: chatID,
        type: type
    }, false);
    const conversationMessages = await conversation.messages;

    // Sort messages so they are shown in the correct order.
    conversationMessages.sort((a, b) => {
        if(a.id > b.id){
            return -1;
        }else{
            return 1;
        }
    });

    // Check if the user is scrolled all the way down, or they sent a message, if so, keep the user scrolled down.
    const messagesDiv = chat.querySelector("#messages");
    if(messagesDiv.scrollTop === messagesDiv.scrollTopMax || calledFromSendMessage){
        scrollToBottom = true;
    }

    messagesDiv.innerHTML = "";

    // Create a <div> for each message and display the message in that <div>
    conversationMessages.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("messageContainer");
        messageDiv.innerHTML = `
            <div class="messageProfPic" style="background-image: url('${message.profilePicture}');"></div>
            <div class="messageBody">
                <div class="messageInfo">
                    <div class="messageUsername">${message.senderName}<img class="ownerIconMessage hidden" src="media/ownerIcon.png"></div>
                    <div class="messageTimestamp">${message.timestamp}</div>
                </div>
                <div class="messageText">${message.text}</div>
            </div>
        `;
        // If its a groupchat and the user is the owner, put a crown next to their name.
        if(type === "groupChat"){
            if(message.sender === ownerID){
                messageDiv.querySelector(".ownerIconMessage").classList.remove("hidden");
            }
        }

        messagesDiv.appendChild(messageDiv);
    })

    // Scrolls the user all the way down.
    if(scrollToBottom){
        messagesDiv.scrollTop = messagesDiv.scrollTopMax;
    }

    // If startTimeout is true, start a timeout to call this function again in one second.
    if(startTimeout){
        timeout = setTimeout(async function(){
            await fetchAndPrintMessages(chatID, type, user, userPassword, ownerID);
        }, 1000);
    }
}

// This function renders a modal for the user to use to create a groupchat.
async function createGroupChat(userID, userPassword, userFriends){
    let betweenUsers = [userID];
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
        const resource = await fetchChatPhp(userID, userPassword, "POST", {
            chatAction: "createGroupChat",
            chatName: chatName,
            betweenUsers: betweenUsers
        });
        if(resource !== undefined){
            renderChatPage();
        }
    });
    const main = document.querySelector("main");
    main.appendChild(groupChatModal);

}

// This function renders the group options for the current chat, first fetch the groupchat again to fetch latest information about the chat.
async function renderGroupChatOptions(userID, userPassword, chatID, type, userFriends){
    const conversation = await fetchChatPhp(userID, userPassword, "POST", {
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

    // If the user is the owner of the chat, remove hidden from the buttons to change groupname and change members and add eventlisteners to them. Also make the last button be a delete button to delete the chat. The owner cannot leave the chat, they must delete it to leave it.
    if(userID === ownerID){
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
                const newName = await fetchChatPhp(userID, userPassword, "PATCH", {
                    chatAction: "changeGroupName",
                    name: name,
                    chatID: chatID
                });
                // If the response was ok and the fetch didn't return undefined as the resource, update the groupname on the chat window.
                if(newName !== undefined){
                    chat.querySelector("#chatName").textContent = newName;
                    changeGroupNameDom.remove();
                }

            })
            optionsDivDom.appendChild(changeGroupNameDom);
        })

        ownerOptionsDom.querySelector("#changeMembers").addEventListener("click", event => {
            const addFriendsModal = document.createElement("div");

            addFriendsModal.innerHTML = `
                <div class="modalContainer">
                    <div id="friendsSelector"></div>
                    <div id="editMemberTip">When clicking CONFIRM, all marked users will be members!</div>
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
                    await fetchChatPhp(userID, userPassword, "PATCH", {
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
                    await fetchChatPhp(userID, userPassword, "DELETE", {
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
    if(userID !== ownerID){
        optionsDivDom.querySelector("#ownerOptions").remove();

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
                await fetchChatPhp(userID, userPassword, "DELETE", {
                    chatAction: "leaveGroup",
                    chatID: chatID
                });
                confirmationModal.remove();
                renderChatPage();
            });

            optionsDivDom.appendChild(confirmationModal);
        })
    }
    const chat = document.querySelector("#chat");
    chat.appendChild(optionsDivDom);
}

// Fetches all friends of the user with the given userID.
async function fetchFriends(userID, userPassword){
    const GETstring = `userID=${userID}&userPassword=${userPassword}&action=chat`
    const response = await fetchAPI(true, GETstring);
    const resource = await chatResponseHandler(response);

    return await resource;
}

// Function to make a request to the server with any requestbody. There is a premade requestbody that will be combined with the object sent as the variable specificInfo to later use that combined object for the fetch. Object.assign() is the method used to combine the two objects..
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

// This function handles responses, creates a popup that displays an error if it occurs.
async function chatResponseHandler(response){
    if(!response.ok){
        const resource = await response.json();
        const errorModal = document.createElement("div");
        errorModal.innerHTML = `
            <div class="modalContainer">
                <div id="errorMessage">${await resource.message}</div>
                <button id="errorMessageButton">Close</div>
            </div>
        `
        errorModal.classList.add("chatPageModal");

        errorModal.querySelector("#errorMessageButton").addEventListener("click", event => {
            errorModal.remove();
            renderChatPage();
        });

        const main = document.querySelector("main");
        main.appendChild(errorModal);
    }else{
        return await response.json();
    }
}