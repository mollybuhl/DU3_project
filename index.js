//Check if user is already loged in
if(localStorage.getItem("userId") === "true"){
    renderFeedPage();
}else{
    renderHomePage();
}

//renderHomePage(); /* To render header and footer */
//renderDeveloperPage();
//renderRegisterPage();
//renderLoginPage();
//renderFeedPage();
//renderPostingModal();


/*function renderDeveloperPage(){
    document.querySelector("main").innerHTML = `
    <p>Gjorde en liten navigation till de olika funktionerna, så vi slipper ändra på koden varje gång! :) <br>Bara till att lägga till knapp och EventListener ifall det behövs till en ny funktion.</p>
    <button id="renderHomePage">Home Page</button>
    <button id="renderRegisterPage">Register Page</button>
    <button id="renderLoginPage">Login Page</button>
    <button id="renderFeedPage">Feed Page</button>
    <button id="renderPostingModal">Post Modal</button>
    <button id="renderChatPage">Chat Page</button>
    <br>
    `;

    document.querySelector("main > #renderHomePage").addEventListener("click", renderHomePage);
    document.querySelector("main > #renderRegisterPage").addEventListener("click", renderRegisterPage);
    document.querySelector("main > #renderLoginPage").addEventListener("click", renderLoginPage);
    document.querySelector("main > #renderFeedPage").addEventListener("click", renderFeedPage);
    document.querySelector("main > #renderPostingModal").addEventListener("click", renderPostingModal);
    document.querySelector("main > #renderChatPage").addEventListener("click", renderChatPage);
}
