
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

    //Create a display for users X last posts;
    let postDisplay = document.createElement("div");
    postDisplay.classList.add("postDisplay");
    main.querySelector(".feedWrapper").appendChild(postDisplay);

    let postedByUser = User.posts;
    postedByUser.sort(compare);
    function compare(a,b){
        //console.log(a.timestamp);
        //console.log(b.timestamp);
        return b.timestamp - a.timestamp;
    }

    postedByUser.forEach(post => { 
        let createdPost = createPostInFeed(User, post);
        postDisplay.appendChild(createdPost);

        createdPost.querySelector("#deletePost").addEventListener("click", deletePost);

        async function deletePost (event){
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
                const request = new Request("feed.php", requestOptions);
                let response = await fetch(request);
                let resource = await response.json();
            }catch(error){
                console.log(error);
            }
            
        }

    });

    /*let deletePostButtons = document.querySelectorAll("#deletePost")
    deletePostButtons.forEach(deletePostbutton => {
        deletePostbutton.addEventListener("click", deletePost);
    });*/
    

    
    
    
    //For each friend create a display with their X last posts
    let friendsOfUser = User.friends;
    let friendNames = [];
    friendsOfUser.forEach(friendId => {
        Users.forEach(user => {
            if(user.id === friendId){
                friendNames.push(user.username); //Neccecary?

                let friendsPostDisplay = document.createElement("div");
                friendsPostDisplay.classList.add("friendsPostDisplay");
                main.querySelector(".feedWrapper").appendChild(friendsPostDisplay);

                let postedBy = user.username;
                let posts = user.posts;

                posts.sort(compare);
                function compare(a,b){
                    return b.timestamp - a.timestamp;
                }
        
                posts.forEach(post=> {
                    friendsPostDisplay.appendChild(createPostInFeed(postedBy, post));
                });

            }
        })
    });


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
 
   

    //Create posts in feed
    /*
    if(posts.length === 0 ){
        const newPost = document.createElement("div");
        newPost.classList.add("no_post_info")
        newPost.innerHTML = `<p>Add friends to see their posts here!</p>`;
        
        main.querySelector(".feedWrapper").appendChild(newPost);
    }
   */

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