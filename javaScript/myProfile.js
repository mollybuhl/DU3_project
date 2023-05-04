"use strict";

async function renderProfilePage() {

    let userId = window.localStorage.getItem("userId");

    let getRequest = new Request(`../php/myProfile.php?id=${userId}`);
    
    let response = await fetch(getRequest);
    let resource = await response.json();

    if(!response.ok) {
        main.innerHTML = "<p>Failed to load the profile page. Please try again.</p>";
        return;
    }

    let profilePicture = resource.profilePicture;
    let username = resource.username;
    let loggedFeelings = resource.loggedFeelings;


    let year = new Date().getFullYear();
    let dateOfTheMonth = new Date().getDate();

    let month = "";

    switch(new Date().getMonth()) {
        case 0:
            month = "January";
            break;
        case 1:
            month = "February";
            break;
        case 2:
            month = "March";
            break;
        case 3:
            month = "April";
            break;
        case 4: 
            month = "May";
            break;
        case 5: 
            month = "June";
            break;
        case 6:
            month = "July";
            break;
        case 7:
            month = "August";
            break;
        case 8: 
            month = "September";
            break;
        case 9: 
            month = "October";
            break;
        case 10:
            month = "November";
            break;
        case 11:
            month = "December";
            break;

    }

    let beginningOfWeek = "";
    let endOfWeek = "";
    let today = "";

    switch(new Date().getDay()) {
        case 0:
            beginningOfWeek = dateOfTheMonth - 6;
            endOfWeek = dateOfTheMonth;
            today = "Su";
            break;
        case 1:
            beginningOfWeek = dateOfTheMonth;
            endOfWeek = dateOfTheMonth + 6;
            today = "Mo";
            break;
        case 2:
            beginningOfWeek = dateOfTheMonth - 1;
            endOfWeek = dateOfTheMonth + 5;
            today = "Tu";
            break;
        case 3:
            beginningOfWeek = dateOfTheMonth - 2;
            endOfWeek = dateOfTheMonth + 4;
            today = "We";
            break;
        case 4: 
            beginningOfWeek = dateOfTheMonth - 3;
            endOfWeek = dateOfTheMonth + 3;
            today = "Th";
            break;
        case 5: 
            beginningOfWeek = dateOfTheMonth - 4;
            endOfWeek = dateOfTheMonth + 2;
            today = "Fr";
            break;
        case 6:
            beginningOfWeek = dateOfTheMonth - 5;
            endOfWeek = dateOfTheMonth + 1;
            today = "Sa";
            break;
    }

    let week = `${month} ${beginningOfWeek}-${endOfWeek}, ${year}`;
    console.log(week);

    let main = document.querySelector("main");
    main.innerHTML = `
        <div id="profilePicture"></div>
        <div id="profileUsername">${username}</div>
        <div id="calendar">
            <p id="calendarWeek">${week}</p>
            <div id="weekdays">
                <p>Mo</p>
                <p>Tu</p>
                <p>We</p>
                <p>Th</p>
                <p>Fr</p>
                <p>Sa</p>
                <p>Su</p>
            </div>
        </div>
        <button id="logout">Logout</button>
    `;

    let weekdays = document.querySelectorAll("div#weekdays > p");
    for(let i = 0; i < weekdays.length; i++) {
        if(weekdays[i].textContent === today) {
            weekdays[i].classList.add("today");
        }
    }

    let profilePictureDiv = document.getElementById("profilePicture");
    profilePictureDiv.style.backgroundImage = `url(../media/${profilePicture})`;

    
    let body = document.querySelector("body");
    body.classList.remove("bodyFeed");
    body.classList.add("profileBody");
    let header = document.querySelector(".profileBody > header");
    header.classList.remove("home");
    header.classList.remove("feedHeader");
    header.classList.add("profileHeader");
    let footer = document.querySelector("footer");
    main.classList.remove("mainFeed");
    main.classList.add("mainProfile");
    

    document.getElementById("logout").addEventListener("click", logout);

    let divs = document.querySelectorAll(".profileHeader > div");
    console.log(divs);

    for(let i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }

    let settingsButton = document.createElement("button");
    header.appendChild(settingsButton);
    settingsButton.setAttribute("id", "settingsButton");
    settingsButton.textContent = "Settings";

    //let date = `${month} ${dateOfTheMonth}, ${year}`;
    //Today's date if needed?
}

function logout() {
    window.localStorage.setItem("loggedIn", "false");
    renderHomePage();
}