
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

    //Locate users' friends. 
    let User_id = (Number(window.localStorage.getItem("userId"))); 
    let User = Users.find(user => user.id === User_id);
    let friendsOfUser = User.friends;

    let posts = [];
    let friendNames = [];
    
    //Push all friends posts into array "posts".
    friendsOfUser.forEach(friendId => {
        Users.forEach(user => {
            if(user.id === friendId){
                friendNames.push(user.username);
                let friendPosts = user.posts;
                friendPosts.forEach(post => {
                    posts.push(post)
                })
            }
        })
    });

    
    //Push the users own posts into array "posts".
    let UserPosts = User.posts;
    UserPosts.forEach(post => {
        posts.push(post);
    });
    
    //Order posts by date published.
    //let PostTimeOrder = posts.sort()

    //Create posts in feed
    if(posts.length === 0){
        const newPost = document.createElement("div");
        newPost.classList.add("no_post_info")
        newPost.innerHTML = `<p>Add friends to see their posts here!</p>`;
        
        main.querySelector(".feedWrapper").appendChild(newPost);
    }else{
        posts.forEach(post => {
            const newPost = document.createElement("div");
            newPost.classList.add("post");
    
            const postedBy = Users.find(user => user["id"] === post["userID"]);
            console.log(postedBy);
            let userName = postedBy["username"];
            console.log(userName);
            
    
            const feeling = post["mood"];
            const text = post["description"];
            const quote = post["quote"];
    
            newPost.innerHTML = `
                <div>
                    <h3>${userName} is feeling: ${feeling}</h3>
                </div>
                <button id="deletePost">X</button>
                <div class="textBox">
                    <h4>Why I'm feeling ${feeling}:</h4> 
                    <p> ${text}</p> 
                    <p><h5>Quote: </h5>"${quote}"</p>
                </div>
                `;
    
            switch(feeling){
                case "Happy":
                    newPost.classList.add("happy");
                    break;
                case "Sad":
                    newPost.classList.add("sad");
                    break;
            }
            
            main.querySelector(".feedWrapper").appendChild(newPost);
        });
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
        
        Users.forEach(user => {
            if(searchName === user["username"]){
                if(confirm(`"Do you want to add ${searchName} to your Friends?"`)){ //If user is found ask to confirm friend request
                   
                    //Send friend request
                    sendFriendRequset(User_id, searchName);  
                    return;                  
                };
            }
        });
        document.querySelector("#searchWrapper > .messageToUser").textContent = "User not found";

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
async function sendFriendRequset(userFrom, userTo){

    const friendRequest = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
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
            document.querySelector("#searchWrapper > .messageToUser").textContent = `A Friend Request was sent to ${searchName}!`;
            document.querySelector("#searchWrapper > form > input").value = "";
        }

    }catch(error){
        document.querySelector("#searchWrapper > .messageToUser").textContent = `An Error occured, please try again later`;
    }
    
}