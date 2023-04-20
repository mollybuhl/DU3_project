
function renderFeedPage(){
    let main = document.querySelector("main");
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");

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