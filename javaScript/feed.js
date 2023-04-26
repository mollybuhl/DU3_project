
async function renderFeedPage(){
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");
    let main = document.querySelector("main");
    document.querySelector("body").classList.add("bodyFeed");

    
    main.innerHTML = `
        <div class="backgroundImage"></div>
        <div class="feedWrapper"></div>`
    ;
    
    //Fetching Users
    let response = await fetch("../php/feed.php");
    let Users = await response.json();

    //Locate logged in users' friends. 
    //Fetch user from localstorage
    let User_id = 1;
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

        const postedBy = Users.find(user => user["id"] === post["postedBy"]);
        let userName = postedBy["username"];

        const feeling = post["feeling"];
        const text = post["text"];
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




    header.classList.add("feedHeader");
    header.innerHTML = `
        <div class="friendDisplay hidden">
            <div>
                <h2>Friends</h2>
                <div id="closeFriendDisplay"></div>
            </div>
            <div class="friends"></div>
        </div>
        <h3 class="logo">MoodMate</h3>
        <div class="friendsButton"></button>
    `;

    //Add each friend to friend list.
    friendNames.forEach(friend => {
        let friendBox = document.createElement("div");
        friendBox.innerHTML = `
        <p>${friend}</p>
        `;
        document.querySelector("header > .friendDisplay > .friends").appendChild(friendBox);
    })

    document.querySelector("header > .friendsButton").addEventListener("click", function (){
        document.querySelector(".friendDisplay").classList.remove("hidden");
    });
    document.querySelector("#closeFriendDisplay").addEventListener("click", function(){
        document.querySelector(".friendDisplay").classList.add("hidden");
    })


    footer.classList.add("feed");

    footer.innerHTML = `
        <div class="feedButton"></div>
        <div class="profileButton"></div>

    `;

    document.querySelector(".feedButton").addEventListener("click", renderFeedPage);
    //document.querySelector(".profileButton").addEventListener("click", renderProfilePage);

}