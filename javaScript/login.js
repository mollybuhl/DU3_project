"use strict";

function renderLoginPage() {
    document.querySelector("body").classList.add("bodyRegisterLogin");

    let headerButton = document.querySelector("header > .loginButton");
    headerButton.classList.add("hidden");
    
    let main = document.querySelector("main");
    main.classList.add("mainLogin");
    main.innerHTML = `
        <div class="wrapper">
            <h1>Login</h1>
            <p id="switchToRegistration">Don't have an account yet?<span> Make one here!</span></p>
            <div id="loginField">
                <label for="loginUsername">Username</label>
                <input type="text" id="loginUsername" placeholder="Enter username">
                <label for="loginPassword">Password</label>
                <input type="password" id="loginPassword" placeholder="Enter password">
            </div>
            <p class="messageToUser"></p>
            <button>Login</button>
        </div>
    `;

    document.querySelector("main > .wrapper > button").addEventListener("click", callServerToLogin);
    document.querySelector("#switchToRegistration").addEventListener("click", renderRegisterPage);
}

async function callServerToLogin() {
    const username = document.querySelector("#loginUsername").value;
    const password = document.querySelector("#loginPassword").value;

    let requestOptions = ("../php/login.php", {
        method: "POST",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({
            username: username,
            password: password,
            action: "login"
        })
    });

    let response = await fetchAPI(false, requestOptions);
    let resource = await response.json();
    console.log(response);

    if(!response.ok) {
        document.querySelector(".mainLogin > .wrapper >.messageToUser").innerHTML = response.message;
    } else {
        window.localStorage.setItem("userPassword", document.querySelector("#loginPassword").value);
        window.localStorage.setItem("userId", `${resource.id}`);
        window.localStorage.setItem("loggedIn", "true");   

        renderFeedPage();
    }

}

