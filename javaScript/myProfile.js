"use strict";

async function renderProfilePage() {

    let userId = window.localStorage.getItem("userId");

    let getRequest = new Request(`../php/myProfile.php?id=${userId}`);
    
    let response = await fetch(getRequest);
    let resource = await response.json();

    let main = document.querySelector("main");

    if(!response.ok) {
        main.innerHTML = "<p>Failed to load the profile page. Please try again.</p>";
        return;
    }

    let profilePicture = resource.profilePicture;
    let username = resource.username;
    let postsOfUser = resource.postsOfUser;
    let storedMoods = resource.storedMoods;

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

    main.innerHTML = `
    <div id="profilePicture"></div>
    <div id="profileUsername">${username}</div>
    <div id="calendar">
        <p id="calendarWeek">${week}</p>
        <div id="weekdays">
            <div id="mondayContainer"><p>Mo</p></div>
            <div id="tuesdayContainer"><p>Tu</p></div>
            <div id="wednesdayContainer"><p>We</p></div>
            <div id="thursdayContainer"><p>Th</p></div>
            <div id="fridayContainer"><p>Fr</p></div>
            <div id="saturdayContainer"><p>Sa</p></div>
            <div id="sundayContainer"><p>Su</p></div>
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

    for(let i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }

    let settingsButton = document.createElement("button");
    header.appendChild(settingsButton);
    settingsButton.setAttribute("id", "settingsButton");
    settingsButton.textContent = "Settings";

    //let date = `${month} ${dateOfTheMonth}, ${year}`;
    //Today's date if needed?

    makeCalendar(postsOfUser, month, beginningOfWeek, storedMoods, week);
}

function logout() {
    window.localStorage.setItem("loggedIn", "false");
    window.localStorage.removeItem("userId");
    renderHomePage();
}

function makeCalendar(arrayOfPosts, month, beginningOfWeek, storedMoods, week) {

    let currentMonthPosts = [];
    for(let i = 0; i < arrayOfPosts.length; i++) {
        let postObject = arrayOfPosts[i];
        let postTimestamp = postObject.timestamp;
        if(postTimestamp.includes(month)) {
            currentMonthPosts.push(postObject);
        }
    }
    let dayCounter = beginningOfWeek;
    while(dayCounter <= beginningOfWeek + 6) {
        for(let i = 0; i < currentMonthPosts.length; i++) {
            let timestampOfPost = currentMonthPosts[i].timestamp;
            let dayOfPosting = currentMonthPosts[i].dayOfWeek;
            let moodInPost = currentMonthPosts[i].mood;

            if(timestampOfPost.includes(` ${dayCounter} `)) {
                let weekExists = false;
                for(let i = 0; i < storedMoods.length; i++) {
                    if(storedMoods[i].week === week) {
                        storedMoods[i][`${dayOfPosting}`] += `${moodInPost} `;
                        weekExists = true;
                    }
                }

                if(weekExists === false) {                    
                    storedMoods.push({
                        week: week,
                    });

                    for(let i = 0; i < storedMoods.length; i++) {
                        if(storedMoods[i].week === week) {
                            storedMoods[i][`${dayOfPosting}`] = `${moodInPost} `;
                        }
                    }
                }
            }
        }
        dayCounter++;
    }
    console.log(storedMoods);

    for(let i = 0; i < storedMoods.length; i++) {
        let weekdays = document.querySelectorAll("#weekdays > div > p");
        let weekMoods = storedMoods[i];
        let arrayOfMoods = [];
        let chosenDay;
        for(let key in weekMoods) {
            if(key == "week") {
                continue;
            }
            let moodsForDay = weekMoods[key];
            arrayOfMoods = moodsForDay.split(" ");

            let weekday = key;
            let firstTwoWords = weekday.substring(0, 2);
            for(let ii = 0; ii < weekdays.length; ii++) {
                if(firstTwoWords === weekdays[ii].textContent) {
                    chosenDay = weekdays[ii];

                    let parentOfParagraph = chosenDay.parentNode;
                    for(let i = 0; i < arrayOfMoods.length; i++) {
                        let moodColor = document.createElement("div");
                        parentOfParagraph.appendChild(moodColor);
                        moodColor.classList.add("feeling");
                         if(arrayOfMoods[i] === "Happy") {
                             moodColor.classList.add("happy");
                        } else if(arrayOfMoods[i] === "Sad") {
                             moodColor.classList.add("sad");
                        } else if(arrayOfMoods[i] === "Angry") {
                            moodColor.classList.add("angry");
                        } else if(arrayOfMoods[i] === "Jealous") {
                            moodColor.classList.add("jealous");
                        } else if(arrayOfMoods[i] === "Couragious") {
                            moodColor.classList.add("couragious");
                        } else if(arrayOfMoods[i] === "Fear") {
                            moodColor.classList.add("fear");
                        }
                    }
                }
            }
        }

    }
    
}