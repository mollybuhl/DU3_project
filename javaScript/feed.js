
async function renderFeedPage(){
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");
    let main = document.querySelector("main");

    document.querySelector("body").classList.add("bodyFeed");
    document.querySelector("main").classList.add("mainFeed");
    main.innerHTML = `
        <div class="backgroundImage"></div>
        <div class="feedWrapper"></div>`
    ;
    
    //Fetching Users
    let response = await fetch("../php/feed.php");
    let Users = await response.json();

    //Locate user by localstorage
    let User_id = (Number(window.localStorage.getItem("userId"))); 
    let User = Users.find(user => user.id === User_id);
    let postedByUser = User.posts;

    //If user has not posted anything, display nothing.
    if(postedByUser.length > 0){

        //Create a display for users X last posts;
        let postDisplay = document.createElement("div");
        postDisplay.classList.add("postDisplay");
        main.querySelector(".feedWrapper").appendChild(postDisplay);

        //Sort post by timestamp
        postedByUser.sort(compare);
        function compare(a,b){
            //console.log(a.timestamp);
            //console.log(b.timestamp);
            return b.timestamp - a.timestamp;
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
                            userID: User_id,
                            postID: postID,
                        })
                    }
        
                    try{
                        const request = new Request("../php/feed.php", requestOptions);
                        let response = await fetch(request);
                        let resource = await response.json();
                        renderFeedPage();
                    }catch(error){
                        console.log(error);
                    }
                }
            }
        });
    }
    
    //For each friend create a display with their X last posts
    let friendsOfUser = User.friends;
    let friendNames = [];

    if(friendsOfUser.length < 0){
        const noPostInfoDisplay = document.createElement("div");
        noPostInfoDisplay.classList.add("no_post_info")
        noPostInfoDisplay.innerHTML = `<p>Add more friends to see their posts here!</p>`;
            
        main.querySelector(".feedWrapper").appendChild(noPostInfoDisplay);
        
    }else{
        friendsPostStatus = "noPosts";

        friendsOfUser.forEach(friendId => {
            Users.forEach(user => {
                if(user.id === friendId){
                    friendNames.push(user.username); //Neccecary?
    
                    let postedBy = user.username;
                    let posts = user.posts;

                    if(posts.length > 0){
                        let friendsPostDisplay = document.createElement("div");
                        friendsPostDisplay.classList.add("friendsPostDisplay");
                        main.querySelector(".feedWrapper").appendChild(friendsPostDisplay);
        
                        posts.sort(compare);
                        function compare(a,b){
                            return b.timestamp - a.timestamp;
                        }
                
                        posts.forEach(post=> {
                            friendsPostDisplay.appendChild(createPostInFeed(postedBy, post));
                        });

                        friendsPostStatus = "posts";
                    }
                }
            })
        });

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
            <h5>Quote: </h5><p>"${quote}"</p>
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
            case "Fearful":
                newPost.classList.add("fearful");
            break;
        }

        return newPost;
    }

    //Header
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
        <div class="friendsButton"></button>
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
        document.querySelector("header > .friendDisplay > .friends").appendChild(friendBox);
    })

    if(User.friendRequests.length > 0){
        document.querySelector(".friendRequestsDisplay").classList.remove("hidden");

        let activeFriendRequests = User.friendRequests;
        activeFriendRequests.forEach(friendRequest => {

            Users.forEach(user => {
                if(user.id === friendRequest){
                    const singleFriendRequest = document.createElement("div");
                    singleFriendRequest.innerHTML = `
                    <img src="../media/profile_imgs/${user.profilePicture}"> 
                    <h4>${user.username}</h4>
                    <button id="acceptFriendRequest">Accept</button>
                    <button id="declineFriendRequest">Decline</button>
                    `;
                    document.querySelector(".friendRequestsDisplay > #activeRequests").appendChild(singleFriendRequest);

                    singleFriendRequest.querySelector(".friendRequestsDisplay > #activeRequests > div > #declineFriendRequest").addEventListener("click", declineFriendRequest);
                    function declineFriendRequest(event){
                        if(confirm(`Do you want to remove friend request from ${user.username}?`)){
                            sendFriendRequset(friendRequest, User.id, "declineRequest");
                        }
                    }

                    singleFriendRequest.querySelector(".friendRequestsDisplay > #activeRequests > div > #acceptFriendRequest").addEventListener("click", acceptFriendRequest);
                    function acceptFriendRequest(event){
                        if(confirm(`Do you want to add ${user.username} to your friends?`)){
                            sendFriendRequset(friendRequest, User.id, "acceptRequest");
                        }
                    }
                }
            });
        });
    }

    //Display friends pop-up by clicking friends-button
    document.querySelector("header > .friendsButton").addEventListener("click", function (){
        document.querySelector(".friendDisplay").classList.remove("hidden");
    });

    //Hide friends pop-up by clicking exit-button
    document.querySelector("#closeFriendDisplay").addEventListener("click", function(){
        document.querySelector(".friendDisplay").classList.add("hidden");
    })

    //Display friend chat when clicking on chat-icon in the friends pop-up
    document.querySelector("header > .friendDisplay > .friends > div > .chat_icon");

    //Search for friends
    document.querySelector("#searchWrapper > form > button").addEventListener("click", function(event){
        event.preventDefault();

        searchName = document.querySelector("#searchWrapper > form > input").value;
        let found = false;
        
        Users.forEach(user => {
            if(searchName === user["username"]){
                found = true;
                let usersCurrentFriends = User.friends;

                if(usersCurrentFriends.includes(user["id"])){
                    alert(`You are already friends with ${searchName}`);
                }else{
                    if(confirm(`Do you want to add ${searchName} to your Friends?`)){ 
                        sendFriendRequset(User_id, searchName, sendRequest);  
                        return;                  
                    };
                }
            }
        });
        
        if(found === false){
            document.querySelector("#searchWrapper > .messageToUser").textContent = "User not found";
        };
    });

    //Loged in footer
    footer.classList.add("footerFeed");
    footer.innerHTML = `
        <div class="chatButton"></div>
        <div class="feedButton"></div>
        <div class="postButton"></div>
        <div class="profileButton"></div>
    `;

    //Render feed page when clicking feed icon in menu
    document.querySelector(".feedButton").addEventListener("click", renderFeedPage);
    //Render posting page when clicking add post button in menu
    document.querySelector(".postButton").addEventListener("click", renderPostingModal);
    //Render Chat when clicking chat icon in menu
    document.querySelector(".chatButton").addEventListener("click", renderChatPage);
    //Render profile when clicking on profile icon in menu
    document.querySelector(".profileButton").addEventListener("click", renderProfilePage);

}

//Send friend request
async function sendFriendRequset(userFrom, userTo, action){

    const friendRequest = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            action: action,
            userFrom: userFrom,
            userTo: userTo,
        })
    }

    try{
        const request = new Request("../php/addFriend.php", friendRequest);
        let response = await fetch(request);
        let resource = await response.json();
    
        // If the response was unsuccessful for any reason, print the error message to the user. Otherwise tell the user their account has been created then redirect them to the login page.
        if(!response.ok){
            document.querySelector("#searchWrapper > .messageToUser").textContent = `${response.message}`;

        }else{  
            if(resource.action === "acceptRequest"){
                alert("Friend Request Accepted"); //To much?
                renderFeedPage();
            } 
            if(resource.action === "declineRequest"){
                alert("Friend Request Declined"); //To much?
                renderFeedPage();
            }
            if(resource.action === "search"){
                document.querySelector("#searchWrapper > .messageToUser").textContent = `A Friend Request was sent to ${searchName}!`;
                document.querySelector("#searchWrapper > form > input").value = "";
            }     
        }

    }catch(error){
        document.querySelector("#searchWrapper > .messageToUser").textContent = `An Error occured, please try again later`;
    }
    
}