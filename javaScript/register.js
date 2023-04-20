"use strict";

function renderRegisterPage(){
    const mainDom = document.querySelector("body > main");
    mainDom.innerHTML = `
    <div id="wrapper">
        <div id="registerLogo"></div>
        <div id="registerField">
            <label for="username">Username</label>
            <input type="text" id="registerUsername" name="username">
            <label for="password">password</label>
            <input type="password" id="registerPassword" name="password">
        </div>
        <p id="messageToUser"></p>
        <button>Register</button>
        <p id="goToLogin">Already have an account? Login here!</p>
    </div>
    `;

    document.querySelector("#wrapper > button").addEventListener("click", onClickRegister);
    document.querySelector("#goToLogin").addEventListener("click", renderLoginPage);
}

async function onClickRegister(){
    const username = document.querySelector("#registerUsername").value;
    const password = document.querySelector("#registerPassword").value;

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            password: password,
        })
    };

    const request = new Request("../php/register.php", requestOptions);
    let response = await fetch(request);
    let resource = await response.json();

    const messageToUserDom = document.querySelector("#messageToUser");

    if(!response.ok){
        messageToUserDom.innerHTML = resource.message;
    }else{
        messageToUserDom.innerHTML = "Your account has been created! You will now be redirected to the login page.";
        setTimeout(renderLoginPage(), 2000)
    }
}