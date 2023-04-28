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
            month = "Febraury";
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

    let begginingOfWeek = "";
    let endOfWeek = "";

    switch(new Date().getDay()) {
        case 0:
            begginingOfWeek = dateOfTheMonth - 6;
            endOfWeek = dateOfTheMonth;
            break;
        case 1:
            begginingOfWeek = dateOfTheMonth;
            endOfWeek = dateOfTheMonth + 6;
            break;
        case 2:
            begginingOfWeek = dateOfTheMonth - 1;
            endOfWeek = dateOfTheMonth + 5;
            break;
        case 3:
            begginingOfWeek = dateOfTheMonth - 2;
            endOfWeek = dateOfTheMonth + 4;
            break;
        case 4: 
            begginingOfWeek = dateOfTheMonth - 3;
            endOfWeek = dateOfTheMonth + 3;
            break;
        case 5: 
            begginingOfWeek = dateOfTheMonth - 4;
            endOfWeek = dateOfTheMonth + 2;
            break;
        case 6:
            begginingOfWeek = dateOfTheMonth - 5;
            endOfWeek = dateOfTheMonth + 1;
            break;
    }

    let week = `${month} ${begginingOfWeek}-${endOfWeek}, ${year}`;
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
        `;

    let profilePictureDiv = document.getElementById("profilePicture");
    profilePictureDiv.style.backgroundImage = `url(../media/${profilePicture})`;

    let header = document.querySelector("header");
    header.classList.remove("home");
    let body = document.querySelector("body");
    body.classList.remove("bodyFeed");
    body.classList.add("bodyProfile");

    //let date = `${month} ${dateOfTheMonth}, ${year}`;
    //Today's date if needed?
}