"use strict";

function renderLoginPage() {
    
    let main = document.querySelector("main");
    main.innerHTML = `
    <input type="text" id="loginUsername" placeholder="Username">
    <input type="password" id="loginPassword" placeholder="Password">
    <p id="messageToUser"></p>
    <button>Login</button>
    <p id="switchToRegistration">Don't have an account yet? Make one here!</p>
    `;

    document.querySelector("main > button").addEventListener("click", callServerToLogin);
    document.querySelector("#switchToRegistration").addEventListener("click", renderRegisterPage);
}

async function callServerToLogin() {
    const username = document.querySelector("#loginUsername").value;
    const password = docuement.querySelector("#loginPassword").value;

    let response = await fetch("../php/login.php", {
        method: "POST",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    let resource = await response.json();

    if(!response.ok) {
        //Message from server
        document.getElementById("messageToUser").innerHTML = resource.message;
    } else {
        if(resource.firstTime === true) {
            renderFeedPage();
        } else {
            renderFeedPage();
        }
    }


}

