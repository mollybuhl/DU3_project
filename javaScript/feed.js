
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
    let User_id = 1; //This will be id of user saved in localstorage
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
    posts.forEach(post => {
        const newPost = document.createElement("div");
        newPost.classList.add("post");

        const postedBy = Users.find(user => user["id"] === post["userID"]);
        let userName = postedBy["username"];

        const feeling = post["mood"];
        const text = post["description"];
        const quote = post["quote"];

        newPost.innerHTML = `
            <div>
                <h3>${userName} is feeling: ${feeling}</h3>
            </div>
            <div class="textBox">
                <h4>Why I'm feeling ${feeling}:</h4> 
                <p> ${text}</p> 
                <p><h5>Quote: </h5>"${quote}"</p>
            </div>`;

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

    //Search for friends
    document.querySelector("#searchWrapper > form > button").addEventListener("click", function(event){
        event.preventDefault();
        searchName = document.querySelector("#searchWrapper > form > input").value;
        console.log(searchName);
        Users.forEach(user => {
            if(searchName === user["username"]){
                document.querySelector("#searchWrapper > .messageToUser").textContent = "Found";

            }
        });
        document.querySelector("#searchWrapper > .messageToUser").textContent = "User not found";
    })

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
    document.querySelector("header > .friendDisplay > .friends > div > .chat_icon")


    //Footer
    footer.classList.add("feed");
    footer.innerHTML = `
        <div class="chatButton"></div>
        <div class="feedButton"></div>
        <div class="postButton"></div>
        <div class="profileButton"></div>
    `;

    document.querySelector(".feedButton").addEventListener("click", renderFeedPage);
    document.querySelector(".postButton").addEventListener("click", renderPostingModal);
    document.querySelector(".chatButton").addEventListener("click", renderChatPage);
    document.querySelector(".profileButton").addEventListener("click", renderProfilePage);

}