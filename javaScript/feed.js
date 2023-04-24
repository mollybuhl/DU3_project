
async function renderFeedPage(){
    let main = document.querySelector("main");
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");
    
    //Fetching Users
    let response = await fetch("../php/feed.php");
    let Users = await response.json();

    //Locate logged in users' friends. 
    let User_id = "";
    let User = Users.find(user => user.id === User_id);

    let posts = [];
    let friendsOfUser = User.friends;
    friendsOfUser.forEach(friend => {
        friendPosts = friend.posts;
        friendPosts.forEach(post => {
            posts.push(post);
        });
    });
    
    //Users' own previous posts.
    let UserPosts = User.posts;
    UserPosts.forEach(post => {
        posts.push(post);
    });
    
    let PostTimeOrder = posts.sort()




    header.classList.add("feedHeader");
    header.innerHTML = `
    <p>Here you will se your friends</p>
    `;

    main.innerHTML = `
    <p>Add Friends to see their updates</p>
    `;

    footer.classList.add("feed");

    footer.innerHTML = `
        <div class="feedButton">FEED</div>
        <div class="profileButton">PROFILE</div>

    `;

    document.querySelector(".feedButton").addEventListener("click", renderFeedPage);
    document.querySelector(".profileButton").addEventListener("click", renderProfilePage);

}