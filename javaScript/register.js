"use strict";

function renderRegisterPage(){
    document.querySelector("body").classList.add("bodyRegisterLogin");
    let headerButton = document.querySelector("header > .loginButton");
    headerButton.classList.remove("hidden");

    const mainDom = document.querySelector("body > main");
    mainDom.classList.add("mainRegister");
    mainDom.innerHTML = `
    <div class="wrapper">
        <h1>Sign up</h1>
        <p id="goToLogin">Already have an account? <span>Login here!</span></p>
        <div id="registerField">
            <label for="username">Username</label>
            <input type="text" id="registerUsername" name="username" placeholder="Enter username">
            <label for="password">Password</label>
            <input type="password" id="registerPassword" name="password" placeholder="Enter password">
        </div>
        <p id="messageToUser"></p>
        <button>Register</button>
    </div>
    `;

    document.querySelector(".wrapper > button").addEventListener("click", onClickRegister);
    document.querySelector("#goToLogin").addEventListener("click", renderLoginPage);
}

async function onClickRegister(){
    const username = document.querySelector("#registerUsername").value;
    const password = document.querySelector("#registerPassword").value;

    // The options sent with the register request.
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            username: username,
            password: password,
        })
    };

    try{

        const request = new Request("../php/register.php", requestOptions);
        let response = await fetch(request);
        let resource = await response.json();
    
        const messageToUserDom = document.querySelector("#messageToUser");
    
        // If the response was unsuccessful for any reason, print the error message to the user. Otherwise tell the user their account has been created then redirect them to the login page.
        if(!response.ok){
            messageToUserDom.innerHTML = resource.message;
        }else{
            messageToUserDom.innerHTML = "Your account has been created! You will now be redirected to the login page.";
            setTimeout(renderLoginPage, 3000);
        }

    }catch(error){
        console.log(error);
    }

}