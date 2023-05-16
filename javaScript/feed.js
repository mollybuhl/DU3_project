"use strict";

/*
    - Connect friend chat to chat icon 
    - Action if fetch users fail
    - Fade-out header
    - Friends name and img display
*/

async function renderFeedPage(){
    let UserID = (Number(window.localStorage.getItem("userId"))); 
    let userPassword = window.localStorage.getItem("userPassword");

    document.querySelector("body").removeAttribute("class");
    document.querySelector("body").classList.add("bodyFeed");
    
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");
    let main = document.querySelector("main");
    

    main.removeAttribute("class");
    main.classList.add("mainFeed");
    main.innerHTML = `
        <div class="backgroundImage"></div>
        <div class="feedWrapper"></div>`
    ;
    
    //Fetching Users
    let response = await fetchAPI(true, `action=feed&userID=${UserID}&userPassword=${userPassword}`);
    if(!response.ok){
//What should be done?        window.localStorage.clear();
//filen existerar inte, fel metod, fel parametrar skickade
    }

    let Users = await response.json();
    let User = Users.find(user => user.id === UserID);
    

    let postedByUser = User.posts;
    //If user has not posted anything, display nothing.
    if(postedByUser.length > 0){

        //Create a display for user posts;
        let postDisplay = document.createElement("div");
        postDisplay.classList.add("postDisplay");
        main.querySelector(".feedWrapper").appendChild(postDisplay);

        //Sort post by latest posted, only display the seven latest posts
        postedByUser.reverse();
        if(postedByUser.length > 7){
            postedByUser = postedByUser.splice(0, 7);
        }
        
        //Create users post display
        postedByUser.forEach(post => { 
            let createdPost = createPostInFeed(User, post);
            postDisplay.appendChild(createdPost);
    
            createdPost.querySelector("#deletePost").addEventListener("click", deletePost);
    
            async function deletePost (event){

                if(confirm("Would you like to delete this post?")){
                    let postID = post.postID;
                
                    const requestOptions = {
                        method: "DELETE",
                        headers: {"Content-Type": "application/json"},
                        body: JSON.stringify({
                            action: "feed",
                            userID: UserID,
                            userPassword: userPassword,
                            actionCredentials:{"feedAction": "DELETE", "postID": postID},
                        })
                    }
        
                        //let request = new Request("php/api.php", requestOptions);
                        let response = await fetchAPI(false, requestOptions);

                        if(!response.ok){ 
                            alert(`This post could not be deleted. Error message provided: ${response.message}`);                      
                        }else{
                            renderFeedPage();
                        }
                    
                }
            }
        });
    }
    
    //For each friend create a display with their 7 latest posts
    let friendsOfUser = User.friends;
    let friendNames = [];

    if(friendsOfUser.length === 0){
        const noPostInfoDisplay = document.createElement("div");
        noPostInfoDisplay.classList.add("no_post_info");
        noPostInfoDisplay.innerHTML = `<p>Add more friends to see their posts here!</p>`;
            
        main.querySelector(".feedWrapper").appendChild(noPostInfoDisplay);
        
    }else{
        let friendsPostStatus = "noPosts";

        friendsOfUser.forEach(friendId => {
            Users.forEach(user => {
                if(user.id === friendId){
                    friendNames.push(user.username); 
    
                    let postedBy = user.username;
                    let posts = user.posts;

                    if(posts.length > 0){
                        let friendsPostDisplay = document.createElement("div");
                        friendsPostDisplay.classList.add("friendsPostDisplay");
                        friendsPostDisplay.innerHTML = `
                            <div class="friendProfileDisplay">
                                <img src="${user.profilePicture}">
                                <h3>${user.username}</h3>
                            </div>`
                        main.querySelector(".feedWrapper").appendChild(friendsPostDisplay);
        
                        posts.reverse();
                        if(posts.length > 7){
                            posts = posts.splice(0, 7);
                        }
                
                        posts.forEach(post=> {
                            friendsPostDisplay.appendChild(createPostInFeed(postedBy, post));
                        });

                        friendsPostStatus = "posts";
                    }
                }
            })
        });

        //If you have friends but no one has posted
        if(friendsPostStatus === "noPosts"){
            const noPostInfoDisplay = document.createElement("div");
            noPostInfoDisplay.classList.add("no_post_info")
            noPostInfoDisplay.innerHTML = `<p>Add more friends to see their posts here!</p>`;
                
            main.querySelector(".feedWrapper").appendChild(noPostInfoDisplay);
        }
    }

    function createPostInFeed(postedBy, post){
        const newPost = document.createElement("div");
        newPost.classList.add("post");

        const feeling = post["mood"];
        const text = post["description"];
        const quote = post["quote"];
        const timestamp = post["timestamp"];

        if(postedBy === User){
            newPost.innerHTML = `
                <div>
                    <h3>I'm feeling <span>${feeling}</span></h3>
                    <div id="deletePost"></div>
                </div>
                <p class="timestamp">${timestamp}</p>
                <p> ${text}</p> 
                <h5>Quote: </h5><p>"${quote}"</p>
             `;
        }else{
            newPost.innerHTML = `
            <div>
                <h3>I'm feeling <span>${feeling}</span></h3>
            </div>
                <p class="timestamp">${timestamp}</p>
                <p> ${text}</p> 
            <h5>Quote: </h5>
            <p>"${quote}"</p>
         `;
        }
      
        switch(feeling){
            case "Happy":
                newPost.classList.add("happy");
                break;
            case "Sad":
                newPost.classList.add("sad");
                break;
            case "Angry":
                newPost.classList.add("angry");
            break;
            case "Couragious":
                newPost.classList.add("couragious");
            break;
            case "Forgiving":
                newPost.classList.add("forgiving");
            break;
            case "Jealous":
                newPost.classList.add("jealous");
            break;
            case "Fear":
                newPost.classList.add("fear");
            break;
        }

        return newPost;
    }

    //Header
    header.removeAttribute("class");
    header.classList.add("feedHeader");
    header.innerHTML = `
        <div class="friendDisplay hidden">
            <div>
                <h2>Friends</h2>
                <div id="closeFriendDisplay"></div>
            </div>
            <div class="friends"></div>
            <div class="friendRequestsDisplay hidden">
                <h3>Friend Requests</h3>
                <div id="activeRequests"></div>
            </div>
            <div id="searchWrapper">
                <h3>Add Friends</h3>
                <p class="messageToUser"></p>
                <form name="searchForm">
                    <input name="searchbar" type="text" placeholder="Search">
                    <button><img src="../media/search.png"></button>
                </form>
            </div>
        </div>
        <div class="profileInformation">
            <img src="${User["profilePicture"]}">
            <h3>${User["username"]}</h3>
        </div>
        
        <div class="friendsButton">
            <div class="notificationFriendRequest hidden"></div>
        </div>
    `;

    //Add each friend to friend list.
    friendNames.forEach(name => {
        let friend = Users.find(user => user.username === name);

        let friendBox = document.createElement("div");
        friendBox.innerHTML = `
            <img src="${friend["profilePicture"]}">
            <h3>${friend["username"]}</h3>
            <div class="chat_icon"></div>
        `;

//How should this be done?
        friendBox.querySelector(".chat_icon").addEventListener("click", renderFriendChat);
        function renderFriendChat(){
            renderChatPage(null, true, friend["username"]);
        }

        document.querySelector("header > .friendDisplay > .friends").appendChild(friendBox);
    })

    if(User.friendRequests.length > 0){
        document.querySelector("div.notificationFriendRequest").classList.remove("hidden");
        document.querySelector(".friendRequestsDisplay").classList.remove("hidden");

        let activeFriendRequests = User.friendRequests;
        activeFriendRequests.forEach(friendRequest => {

            Users.forEach(user => {
                if(user.id === friendRequest){
                    const singleFriendRequest = document.createElement("div");
                    singleFriendRequest.innerHTML = `
                        <img src="${user.profilePicture}"> 
                        <h3>${user.username}</h3>
                        <button id="acceptFriendRequest">Accept</button>
                        <button id="declineFriendRequest">Decline</button>
                    `;
                    document.querySelector(".friendRequestsDisplay > #activeRequests").appendChild(singleFriendRequest);

                    singleFriendRequest.querySelector(".friendRequestsDisplay > #activeRequests > div > #declineFriendRequest").addEventListener("click", declineFriendRequest);
                    function declineFriendRequest(event){
                        if(confirm(`Do you want to remove friend request from ${user.username}?`)){
                            handleFriendRequset(friendRequest, User.id, "declineRequest");
                        }
                    }

                    singleFriendRequest.querySelector(".friendRequestsDisplay > #activeRequests > div > #acceptFriendRequest").addEventListener("click", acceptFriendRequest);
                    function acceptFriendRequest(event){
                        if(confirm(`Do you want to add ${user.username} to your friends?`)){
                            handleFriendRequset(friendRequest, User.id, "acceptRequest");
                        }
                    }
                }
            });
        });
    }

    //Display friends pop-up by clicking friends-button
    document.querySelector("header > .friendsButton").addEventListener("click", function (){
        document.querySelector(".friendDisplay").classList.remove("hidden");
        document.querySelector("body").classList.add("noScroll");
        document.querySelector("#searchWrapper > .messageToUser").textContent ="";
    });

    //Hide friends pop-up by clicking exit-button
    document.querySelector("#closeFriendDisplay").addEventListener("click", function(){
        document.querySelector("body").classList.remove("noScroll");
        document.querySelector(".friendDisplay").classList.add("hidden");
    })

    //Search for friends
    document.querySelector("#searchWrapper > form > button").addEventListener("click", function(event){
        event.preventDefault();

        let searchName = document.querySelector("#searchWrapper > form > input").value;
        let found = false;
        
        if(searchName === User.username){
            alert(`You are ${searchName}`);
        }else{

            Users.forEach(user => {
                if(searchName === user["username"]){
                    found = true;
    
                    let usersCurrentFriends = User.friends;
    
                    if(usersCurrentFriends.includes(user["id"])){
                        alert(`You are already friends with ${searchName}`);
                    }else{
                        if(confirm(`Do you want to add ${searchName} to your Friends?`)){ 
                            handleFriendRequset(UserID, searchName, "sendRequest");  
                            return;                  
                        };
                    }
                }
            });
    
            if(found === false){
                document.querySelector("#searchWrapper > .messageToUser").textContent = "User not found";
            };
        }
    });

    //Loged in footer
    footer.classList.add("footerFeed");
    footer.innerHTML = `
        <div>
            <div class="chatButton"></div>
        </div>
        <div>
            <div class="feedButton"></div>
        </div>
        <div>
            <div class="postButton"></div>
        </div>
        <div>
            <div class="profileButton"></div>
        </div>
    `;

    //Select feed
    document.querySelector(".footerFeed > div > .chatButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .postButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .profileButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .feedButton").parentElement.classList.add("selected");

    //Render feed page when clicking feed icon in menu
    document.querySelector(".feedButton").addEventListener("click", renderFeedPage);
    //Render posting page when clicking add post button in menu
    document.querySelector(".postButton").addEventListener("click", renderPostingModal);
    //Render Chat when clicking chat icon in menu
    document.querySelector(".chatButton").addEventListener("click", renderChatPage);
    //Render profile when clicking on profile icon in menu
    document.querySelector(".profileButton").addEventListener("click", renderProfilePage);

    function fadeOutOnScroll(element){
        var distanceToTop = window.pageYOffset + element.getBoundingClientRect().top;
        var elementHeight = element.offsetHeight;
        var scrollTop = document.documentElement.scrollTop;

        var opacity = 1;
        if(scrollTop > distanceToTop){
            opacity = .7 - (scrollTop - distanceToTop) / elementHeight;
        }

        if(opacity >= 0){
            element.style.opacity = opacity;
        }
    }

//If no posts?
    function scrollHandler(){
        var userDisplay = document.querySelector(".postDisplay");
        fadeOutOnScroll(userDisplay);
        var friendsDisplay = document.querySelectorAll(".friendsPostDisplay");

        friendsDisplay.forEach(display => {
            fadeOutOnScroll(display);
        })
    }

    window.addEventListener("scroll", scrollHandler);
}

//Handle friend request
async function handleFriendRequset(requestFrom, requestTo, action){
    let UserID = (Number(window.localStorage.getItem("userId")));
    let userPassword = window.localStorage.getItem("userPassword");

    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: "friendRequests",
            userID: UserID,
            userPassword: userPassword,
            actionCredentials:{"requestAction": action, "requestTo": requestTo, "requestFrom": requestFrom},
        })
    }
    
    let response = await fetchAPI(false, requestOptions);
    let resource = await response.json();
    
    if(!response.ok){
        document.querySelector("#searchWrapper > .messageToUser").textContent = `${resource.message}`;

    }else{ 
        
        if(resource.action === "acceptRequest"){
            document.querySelector("#searchWrapper > .messageToUser").textContent = "Friend Request Accepted";
            renderFeedPage();
        } 
        if(resource.action === "declineRequest"){
            document.querySelector("#searchWrapper > .messageToUser").textContent = "Friend Request Declined";
            renderFeedPage();
        }
        if(resource.action === "sendRequest"){
            document.querySelector("#searchWrapper > .messageToUser").textContent = `A Friend Request was sent to ${requestTo}!`;
            document.querySelector("#searchWrapper > form > input").value = "";
        }     
    }
}


