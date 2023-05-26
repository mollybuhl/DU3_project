"use strict";

async function renderFeedPage(){
    let UserID = Number(window.localStorage.getItem("userId")); 
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
    
    //Fetching User and User friends
    let response = await fetchAPI(true, `action=feed&userID=${UserID}&userPassword=${userPassword}&feedAction=getUserInfo`);
    if(!response.ok || resource.user === null){
        window.localStorage.setItem("loggedIn", "false");
        window.localStorage.removeItem("userId");
        renderHomePage();
    }
    let resource = await response.json();

    let User = resource.user;
    let friendsOfUser = resource.userFriends;
    
    let postedByUser = User.posts;
    //If user has not posted anything, display nothing, otherwise create post display.
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
        
        //Display each of users posts
        postedByUser.forEach(post => { 
            let createdPost = createPostInFeed(User, post);
            postDisplay.appendChild(createdPost);
    
            //Display confirm delete post pop up when clicking on delete post button
            createdPost.querySelector("#deletePost").addEventListener("click", deletePopUp);
    
            function deletePopUp (event){

                let confirmDelete = document.createElement("div");
                confirmDelete.classList.add("confirmDelete");
                confirmDelete.innerHTML =`
                    <div>
                        <h3> Would you like to delete this post?</h3>
                        <div>
                            <button class="confirmDeleteYes">YES</button>
                            <button class="confirmDeleteNo">NO</button>
                        </div>
                    </div>
                `;
                main.appendChild(confirmDelete);

                //Remove pop-up when user click NO
                confirmDelete.querySelector("button.confirmDeleteNo").addEventListener("click", closePopUp);
                function closePopUp(){
                    confirmDelete.remove();
                }
                
                //Delete post when user click YES
                confirmDelete.querySelector("button.confirmDeleteYes").addEventListener("click", deletePost);
                async function deletePost(){
                    
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
    
    let friendNames = [];
    //If user has no friends display add friends message. Otherwise, create display for each friends latest posts.
    if(friendsOfUser.length === 0){
        const noPostInfoDisplay = document.createElement("div");
        noPostInfoDisplay.classList.add("no_post_info");
        noPostInfoDisplay.innerHTML = `<p>Add more friends to see their posts here!</p>`;
            
        main.querySelector(".feedWrapper").appendChild(noPostInfoDisplay);
        
    }else{
        let friendsPostStatus = "noPosts";

        friendsOfUser.forEach(friend => {

            friendNames.push(friend.username);

            let postedBy = friend.username;
            let posts = friend.posts;

            if(posts.length > 0){
                let friendsPostDisplay = document.createElement("div");
                friendsPostDisplay.classList.add("friendsPostDisplay");
                friendsPostDisplay.innerHTML = `
                    <div class="friendProfileDisplay">
                        <img src="${friend.profilePicture}">
                        <h3 class="fontYsabeu">${friend.username}</h3>
                    </div>
                    <div class="allPosts"></div>`
                main.querySelector(".feedWrapper").appendChild(friendsPostDisplay);

                posts.reverse();
                if(posts.length > 7){
                    posts = posts.splice(0, 7);
                }
        
                posts.forEach(post=> {
                    friendsPostDisplay.querySelector(".allPosts").appendChild(createPostInFeed(postedBy, post));
                });

                friendsPostStatus = "posts";
            }
        });

        //If you have friends but no one has posted display add more firends message
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
            case "Courageous":
                newPost.classList.add("courageous");
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
            case "Alone":
                newPost.classList.add("alone");
            break;
            case "Funny":
                newPost.classList.add("funny");
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
                    <button><img src="media/search.png"></button>
                </form>
            </div>
        </div>
        <div class="profileInformation">
            <img src="${User["profilePicture"]}">
            <h3 class="fontYsabeu">${User["username"]}</h3>
        </div>
        
        <div class="friendsButton">
            <div class="notificationFriendRequest hidden"></div>
        </div>
    `;

    //Add each friend to friend list.
    friendNames.forEach(name => {
        let friend = friendsOfUser.find(friend => friend.username === name);

        let friendBox = document.createElement("div");
        friendBox.innerHTML = `
            <img src="${friend["profilePicture"]}">
            <h3 class="fontYsabeu">${friend["username"]}</h3>
            <div class="chat_icon"></div>
            <div class="unfriendContainer">
                <div class="unfriend"></div>
            </div>
            
        `;

        friendBox.querySelector(".chat_icon").addEventListener("click", renderFriendChat);
        function renderFriendChat(){
            renderChatPage(true, friend["username"]);
        }

        friendBox.querySelector(".unfriend").addEventListener("click", removeFriend);
        function removeFriend(){
            let confirmDelete = document.createElement("div");
            confirmDelete.classList.add("confirmDelete");
            confirmDelete.innerHTML =`
                <div>
                    <h3> Would you like to remove this friend?</h3>
                    <div>
                        <button class="confirmDeleteYes">YES</button>
                        <button class="confirmDeleteNo">NO</button>
                    </div>
                </div>
            `;
            main.appendChild(confirmDelete);

            //Remove pop-up when user click NO
            confirmDelete.querySelector("button.confirmDeleteNo").addEventListener("click", event => confirmDelete.remove());

            confirmDelete.querySelector("button.confirmDeleteYes").addEventListener("click", confirmRemoveFriend);
            async function confirmRemoveFriend(event){
                confirmDelete.remove();
                const requestOptions = {
                    method: "DELETE",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        action: "friendRequests",
                        userID: UserID,
                        userPassword: userPassword,
                        actionCredentials: {
                            friendID: friend.id
                        }
                    })
                }
                
                let response = await fetchAPI(false, requestOptions);
                if(!response.ok){
                    const message = response.json();
                    alert(`This friend could not be removed. Error message provided: ${message}`);
                }else{
                    renderFeedPage();
                }
            }
        }

        document.querySelector("header > .friendDisplay > .friends").appendChild(friendBox);
    })

    //Friend requests
    if(User.friendRequests.length > 0){
        //Display notification
        document.querySelector("div.notificationFriendRequest").classList.remove("hidden");
        document.querySelector(".friendRequestsDisplay").classList.remove("hidden");

        //Request for friend-requests username and profile picture
        let response = await fetchAPI(true, `action=feed&userID=${UserID}&userPassword=${userPassword}&feedAction=getFriendRequestInfo`);
        if(!response.ok){
           document.querySelector("header > .friendDisplay >.friends").innerHTML =`
            <p>Something went wrong, please try again later</p>
           `
        }else{
            let friendRequestUsers = await response.json();

            friendRequestUsers.forEach(friendRequestUser => {

                const singleFriendRequest = document.createElement("div");
                singleFriendRequest.innerHTML = `
                    <img src="${friendRequestUser.profilePicture}"> 
                    <h3>${friendRequestUser.username}</h3>
                    <button id="acceptFriendRequest">Accept</button>
                    <button id="declineFriendRequest">Decline</button>
                `;
                document.querySelector(".friendRequestsDisplay > #activeRequests").appendChild(singleFriendRequest);

                //Confirm Decline freind request pop-up
                singleFriendRequest.querySelector(".friendRequestsDisplay > #activeRequests > div > #declineFriendRequest").addEventListener("click", declineFriendRequest);
                function declineFriendRequest(event){

                    let confirmHandleRequest = document.createElement("div");
                    confirmHandleRequest.classList.add("confirmHandleRequest");
                    confirmHandleRequest.innerHTML =`
                        <div>
                            <h3> Do you want to remove friend request from ${friendRequestUser.username}?</h3>
                            <div>
                                <button class="confirmHandleRequestYes">YES</button>
                                <button class="confirmHandleRequestNo">NO</button>
                            </div>
                        </div>
                    `;
                    main.appendChild(confirmHandleRequest);

                    //Remove pop-up if user click NO
                    confirmHandleRequest.querySelector("button.confirmHandleRequestNo").addEventListener("click", closeAcceptFriendRequestPopUp);
                    function closeAcceptFriendRequestPopUp(){
                        confirmHandleRequest.remove();
                    }

                    //Decline request if user click YES
                    confirmHandleRequest.querySelector("button.confirmHandleRequestYes").addEventListener("click", acceptFriendRequest);
                    function acceptFriendRequest(){
                        handleFriendRequset(friendRequestUser.id, User.id, "declineRequest");
                    }
                }

                //Confirm Accept friend request pop-up
                singleFriendRequest.querySelector(".friendRequestsDisplay > #activeRequests > div > #acceptFriendRequest").addEventListener("click", acceptFriendRequestPopUp);
                function acceptFriendRequestPopUp(event){

                    let confirmHandleRequest = document.createElement("div");
                    confirmHandleRequest.classList.add("confirmHandleRequest");
                    confirmHandleRequest.innerHTML =`
                        <div>
                            <h3> Do you want to add ${friendRequestUser.username} to your friends?</h3>
                            <div>
                                <button class="confirmHandleRequestYes">YES</button>
                                <button class="confirmHandleRequestNo">NO</button>
                            </div>
                        </div>
                    `;
                    main.appendChild(confirmHandleRequest);

                    //Remove pop-up if user click NO
                    confirmHandleRequest.querySelector("button.confirmHandleRequestNo").addEventListener("click", closeAcceptFriendRequestPopUp);
                    function closeAcceptFriendRequestPopUp(){
                        confirmHandleRequest.remove();
                    }

                    //Accept request if user click YES
                    confirmHandleRequest.querySelector("button.confirmHandleRequestYes").addEventListener("click", acceptFriendRequest);
                    function acceptFriendRequest(){
                        handleFriendRequset(friendRequestUser.id, User.id, "acceptRequest");
                    }
                }
            });
        }   
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
    document.querySelector("#searchWrapper > form > button").addEventListener("click", async function(event){
        event.preventDefault();

        let searchName = document.querySelector("#searchWrapper > form > input").value;
        
        //Inform if user searched for themself
        if(searchName === User.username){
            let handelSearch = document.createElement("div");
            handelSearch.classList.add("handelSearch");
            handelSearch.innerHTML =`
                <div>
                    <h3>You are ${searchName}</h3>
                    <div>
                        <button class="handelSearchYes">OK</button>
                    </div>
                </div>
            `;
            main.appendChild(handelSearch);
           
            handelSearch.querySelector("button").addEventListener("click", closehandelSearchPopUp);
            function closehandelSearchPopUp(){
                handelSearch.remove();
            }
        }else{
            //Search for user
            let response = await fetchAPI(true, `action=feed&userID=${UserID}&userPassword=${userPassword}&feedAction=searchUser&searchInput=${searchName}`);
            let  resource = await response.json();
            if(!response.ok){
                let handelSearch = document.createElement("div");
                handelSearch.classList.add("handelSearch");
                handelSearch.innerHTML =`
                    <div>
                        <h3>${resource.message}</h3>
                        <div>
                            <button class="handelSearchYes">OK</button>
                        </div>
                    </div>
                `;
                main.appendChild(handelSearch);
   
                handelSearch.querySelector("button").addEventListener("click", closehandelSearchPopUp);
                function closehandelSearchPopUp(){
                    handelSearch.remove();
                }
            }else{
                let handelSearch = document.createElement("div");
                    handelSearch.classList.add("handelSearch");
                    handelSearch.innerHTML =`
                        <div>
                            <h3> Do you want to add ${resource.username} to your friends?</h3>
                            <div>
                                <button class="handelSearchYes">YES</button>
                                <button class="handelSearchNo">NO</button>
                            </div>
                        </div>
                    `;
                    main.appendChild(handelSearch);

                    //Remove pop-up if user click NO
                    handelSearch.querySelector("button.handelSearchNo").addEventListener("click", closehandelSearchPopUp);
                    function closehandelSearchPopUp(){
                        handelSearch.remove();
                    }

                    //Send frine request if user click YES
                    handelSearch.querySelector("button.handelSearchYes").addEventListener("click", sendRequest);
                    function sendRequest(){
                        handleFriendRequset(UserID, searchName, "sendRequest");  
                        handelSearch.remove();
                    }
                }
            }
        }
    );

    //FOOTER
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

    //Fade out post display when reaching header
    function fadeOutOnScroll(element){
        var distanceToTop = window.pageYOffset + element.getBoundingClientRect().top;
        var elementHeight = element.offsetHeight;
        var scrollTop = document.documentElement.scrollTop;

        var opacity = 1;
        if(scrollTop > (distanceToTop - 100)){
            opacity = .4 - (scrollTop - distanceToTop) / elementHeight;
        }

        if(opacity >= 0){
            element.style.opacity = opacity;
        }
    }

    function scrollHandler(){

        //Fade out users own posts
        if(document.querySelector(".postDisplay")){
            var userDisplay = document.querySelector(".postDisplay");
            fadeOutOnScroll(userDisplay);
        }
        
        //Fade out users friends posts
        if(document.querySelectorAll(".friendsPostDisplay")){
            var friendsDisplay = document.querySelectorAll(".friendsPostDisplay");
            friendsDisplay.forEach(display => {
                fadeOutOnScroll(display);
            })
        }
    }

    //Call to fade out post display when reaching header
    window.addEventListener("scroll", scrollHandler);

    //Render feed page when clicking feed icon in menu
    document.querySelector(".feedButton").addEventListener("click", function(){
        renderFeedPage();
    });
    //Render posting page when clicking add post button in menu
    document.querySelector(".postButton").addEventListener("click",function(){
        window.removeEventListener("scroll", scrollHandler);
        renderPostingModal();
    } );
    //Render Chat when clicking chat icon in menu
    document.querySelector(".chatButton").addEventListener("click", function (){
        window.removeEventListener("scroll", scrollHandler);
        renderChatPage();
    });
    //Render profile when clicking on profile icon in menu
    document.querySelector(".profileButton").addEventListener("click", function(){
        window.removeEventListener("scroll", scrollHandler);
        renderProfilePage();
    }); 
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


