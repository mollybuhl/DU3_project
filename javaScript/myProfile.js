"use strict";

async function renderProfilePage() {

    document.querySelector(".footerFeed > div > .chatButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .feedButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .postButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .profileButton").parentElement.classList.add("selected");


    let userId = window.localStorage.getItem("userId");
    let userPassword = window.localStorage.getItem("userPassword");

    let getParameters = `userID=${userId}&userPassword=${userPassword}&action=myProfile`;
    let response = await fetchAPI(true, getParameters);

    let main = document.querySelector("main");

    if(!response.ok) {
        main.innerHTML = "<p>Failed to load the profile page. Please try again.</p>";
        return;
    }

    let resource = await response.json();

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
        <button id="oneWeekBefore"><</button>
        <div id="weekdays">
            <div id="mondayContainer"><p>Mo</p></div>
            <div id="tuesdayContainer"><p>Tu</p></div>
            <div id="wednesdayContainer"><p>We</p></div>
            <div id="thursdayContainer"><p>Th</p></div>
            <div id="fridayContainer"><p>Fr</p></div>
            <div id="saturdayContainer"><p>Sa</p></div>
            <div id="sundayContainer"><p>Su</p></div>
        </div>
        <button id="oneWeekAfter">></button>
    </div>
    `;

    let changeWeekButtons = document.querySelectorAll("div#calendar > button");
    console.log(changeWeekButtons);
    for(let i = 0; i < changeWeekButtons.length; i++) {
        changeWeekButtons[i].addEventListener("click", findWeekForCalendar);
    }

    let weekdays = document.querySelectorAll("div#weekdays > div > p");
    console.log(weekdays);
    for(let i = 0; i < weekdays.length; i++) {
        if(weekdays[i].textContent === today) {
            console.log(today);
            weekdays[i].classList.add("today");
            console.log(weekdays[i]);
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
    main.classList.remove("chatMain");
    

    let divs = document.querySelectorAll(".profileHeader > div");

    for(let i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }

    if(!document.querySelector("button#settingsButton")) {
        let settingsButton = document.createElement("button");
        header.appendChild(settingsButton);
        settingsButton.setAttribute("id", "settingsButton");
    }

    settingsButton.textContent = "Settings";
    settingsButton.addEventListener("click", renderSettingsPopup);

    //let date = `${month} ${dateOfTheMonth}, ${year}`;
    //Today's date if needed?

    prepareCalendar(postsOfUser, month, beginningOfWeek, storedMoods, week);
}

function prepareCalendar(arrayOfPosts, month, beginningOfWeek, storedMoods, week) {

    let currentMonthPosts = [];
    for(let i = 0; i < arrayOfPosts.length; i++) {
        let postObject = arrayOfPosts[i];
        let postTimestamp = postObject.timestamp;
        if(postTimestamp.includes(month)) {
            currentMonthPosts.push(postObject);
        }
    }
    console.log(currentMonthPosts);
    let dayCounter = beginningOfWeek; 
    while(dayCounter <= beginningOfWeek + 6) {
        console.log(dayCounter);
        for(let i = 0; i < currentMonthPosts.length; i++) {
            let potentialNewPost = currentMonthPosts[i];
            let timestampOfPost = currentMonthPosts[i].timestamp;
            let dayOfPosting = currentMonthPosts[i].dayOfWeek;
            let moodInPost = currentMonthPosts[i].mood;
            console.log(moodInPost);
            if(timestampOfPost.includes(` ${dayCounter} `)) {
                let weekExists = false;
                for(let i = 0; i < storedMoods.length; i++) {
                    if(storedMoods[i].week === week) {
                        if(storedMoods[i][`${dayOfPosting}`]) {
                            let arrayForWeekdayKey = storedMoods[i][`${dayOfPosting}`];
                            console.log(arrayForWeekdayKey);
                            addMoodToDay(potentialNewPost, arrayForWeekdayKey);
                        } else {
                            storedMoods[i][`${dayOfPosting}`] = [];
                            let arrayForWeekdayKey = storedMoods[i][`${dayOfPosting}`];
                            addMoodToDay(potentialNewPost, arrayForWeekdayKey);
                        }
                        weekExists = true;
                    }
                }

                if(weekExists === false) {   
                    let weekId = storedMoods.length + 1;                 
                    storedMoods.push({
                        week: week,
                        weekId: weekId
                    });

                    for(let i = 0; i < storedMoods.length; i++) {
                        if(storedMoods[i].week === week) {
                            storedMoods[i][`${dayOfPosting}`] = [];
                            let arrayForWeekdayKey = storedMoods[i][`${dayOfPosting}`];
                            console.log(arrayForWeekdayKey);
                            addMoodToDay(potentialNewPost, arrayForWeekdayKey);
                        }
                    }
                }
            }
        }
        dayCounter++;
    }

    console.log(storedMoods);

    let rightWeek = document.querySelector("#calendar > #calendarWeek").textContent;
    displayRightWeek(rightWeek, storedMoods);

    

            let userPassword = window.localStorage.getItem("userPassword");
            let userId = window.localStorage.getItem("userId");

            let requestDetails = {
                method: "POST",
                headers: {"Content-type": "application/json; charset=UTF-8"},
                body: JSON.stringify({
                    userID: userId,
                    userPassword: userPassword,
                    action: "myProfile",
                    storedMoods: storedMoods
            })};

            fetchAPI(false, requestDetails);
}   

function addMoodToDay(potentialNewPost, arrayForWeekdayKey) {
    let idOfPotentialNewPost = potentialNewPost.postID;
    let moodOfPost = potentialNewPost.mood;

    let postAlreadyStored = false;
    if(arrayForWeekdayKey.length > 0) {
        for(let i = 0; i < arrayForWeekdayKey.length; i++) {
            let storedPostId = arrayForWeekdayKey[i].postId;
            if(idOfPotentialNewPost === storedPostId) {
                postAlreadyStored = true;
            }
        }
    }

    if(moodOfPost === null || moodOfPost === "") {
        return;
    }

    if(postAlreadyStored === false) {
        arrayForWeekdayKey.push({
            postId: idOfPotentialNewPost,
            moodOfPost: moodOfPost
        });
    }
}

async function findWeekForCalendar(event) {
    let userId = window.localStorage.getItem("userId");
    let userPassword = window.localStorage.getItem("userPassword");
    
    let requestDetails = {
        method: "POST",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({
            userID: userId,
            userPassword: userPassword,
            action: "myProfile",
    })};

    let response = await fetchAPI(false, requestDetails);
    let resource = await response.json();

    console.log(event);
    let idOfButton = event.originalTarget.id;

    if(idOfButton === "oneWeekBefore") {
        let currentWeekIdString = event.originalTarget.previousElementSibling.classList[0];
        let currentWeekId = parseInt(currentWeekIdString);

        console.log(currentWeekId);
        let storedMoodsArray = resource.storedMoods;

        let idOfWantedWeek;
        for(let i = 0; i < storedMoodsArray.length; i++) {
            let weekIdInArray = storedMoodsArray[i].weekId;
            if(currentWeekId === weekIdInArray) {
                if(weekIdInArray === 1) {
                    document.querySelector("div#weekdays").textContent = "Sorry, you don't have earlier logged weeks";
                    let minusOneId = weekIdInArray - 1;
                    document.querySelector("p#calendarWeek").setAttribute("class", `${minusOneId}`);
                    document.querySelector("p#calendarWeek").textContent = ":(";
                    //Disable button?
                } else {
                    let idOfCurrentWeek = weekIdInArray;
                    idOfWantedWeek = idOfCurrentWeek - 1;
                    document.querySelector("p#calendarWeek").setAttribute("class", `${idOfWantedWeek}`);
                }
            } else if(currentWeekId === storedMoodsArray.length + 1) {
                let idOfCurrentWeek = storedMoodsArray.length + 1;
                console.log(idOfCurrentWeek);
                idOfWantedWeek = idOfCurrentWeek - 1;
                console.log(idOfWantedWeek);
                document.querySelector("p#calendarWeek").setAttribute("class", `${idOfWantedWeek}`);
            }
        }

        if(idOfWantedWeek !== undefined) {
            for(let i = 0; i < storedMoodsArray.length; i++) {
                let idOfStoredWeek = storedMoodsArray[i].weekId;
                if(idOfStoredWeek === idOfWantedWeek) {
                    let rightWeek = storedMoodsArray[i].week;
                    displayRightWeek(rightWeek, storedMoodsArray);
                }
            }
        }

    } else if(idOfButton === "oneWeekAfter") {
        let currentWeekIdString = event.originalTarget.previousElementSibling.previousElementSibling.previousElementSibling.classList[0];
        let currentWeekId = parseInt(currentWeekIdString);
        console.log(currentWeekId);
        let weekdaysParagraph = event.originalTarget.previousElementSibling.previousElementSibling.previousElementSibling;
        let storedMoodsArray = resource.storedMoods;
        let idOfWantedWeek;

        for(let i = 0; i < storedMoodsArray.length; i++) {

            let weekIdInArray = storedMoodsArray[i].weekId;
            if(weekIdInArray === currentWeekId) {
                if(weekIdInArray === storedMoodsArray.length) {
                    document.querySelector("div#weekdays").textContent = "Sorry, you don't have any more logged weeks";
                    weekdaysParagraph.textContent = ":(";
                    let plusOneId = weekIdInArray + 1;
                    weekdaysParagraph.setAttribute("class", `${plusOneId}`);
                    //Disable button?
                } else {
                    idOfWantedWeek = currentWeekId + 1;
                    weekdaysParagraph.setAttribute("class", `${idOfWantedWeek}`);
                }
            } else if(currentWeekId === 0) {
                idOfWantedWeek = currentWeekId + 1;
                weekdaysParagraph.setAttribute("class", `${idOfWantedWeek}`);
            }
        }
        
        if(idOfWantedWeek !== undefined) {
            for(let i = 0; i < storedMoodsArray.length; i++) {
                let idOfStoredWeek = storedMoodsArray[i].weekId;
                if(idOfStoredWeek === idOfWantedWeek) {
                    let rightWeek = storedMoodsArray[i].week;
                    displayRightWeek(rightWeek, storedMoodsArray);
                }
            }
        }
    }
}

function displayRightWeek(rightWeek, storedMoods) {
    let weekdaysContainer = document.querySelector("#weekdays");
    
    weekdaysContainer.innerHTML = `
        <div id="mondayContainer"><p>Mo</p></div>
        <div id="tuesdayContainer"><p>Tu</p></div>
        <div id="wednesdayContainer"><p>We</p></div>
        <div id="thursdayContainer"><p>Th</p></div>
        <div id="fridayContainer"><p>Fr</p></div>
        <div id="saturdayContainer"><p>Sa</p></div>
        <div id="sundayContainer"><p>Su</p></div>
    
    `;
    console.log(storedMoods);
    if(storedMoods.length >= 1) {
        for(let i = 0; i < storedMoods.length; i++) {
            if(storedMoods[i].week === rightWeek) {
                let weekId = storedMoods[i].weekId;
                document.querySelector("#calendar > #calendarWeek").setAttribute("class", `${weekId}`);
                document.querySelector("#calendar > #calendarWeek").textContent = `${rightWeek}`;
                let weekdays = document.querySelectorAll("#weekdays > div > p");
                let weekMoods = storedMoods[i];
                let rightDay;
        
                for(let key in weekMoods) {
                    if(key === "week" || key === "weekId") {
                        continue;
                    }
                
                    let weekdayKeyName = key;
                    let firstTwoWords = weekdayKeyName.substring(0, 2);
                    console.log(firstTwoWords);
        
                    let weekdayKeyArray = weekMoods[key];
                    console.log(weekdayKeyArray);
        
        
                    for(let ii = 0; ii < weekdays.length; ii++) {
                        if(firstTwoWords === weekdays[ii].textContent) {
                            rightDay = weekdays[ii];
                            console.log(rightDay);
                        }
                    }       
                    
                    let parentOfParagraph = rightDay.parentNode;
                    for(let i = 0; i < weekdayKeyArray.length; i++) {
                        let moodOfDay = document.createElement("div");
                        parentOfParagraph.appendChild(moodOfDay);
                        moodOfDay.classList.add("feeling");
    
                        if(weekdayKeyArray[i].moodOfPost === "Happy") {
                            moodOfDay.classList.add("happy");
                        } else if(weekdayKeyArray[i].moodOfPost === "Sad") {
                            moodOfDay.classList.add("sad");
                        } else if(weekdayKeyArray[i].moodOfPost === "Angry") {
                            moodOfDay.classList.add("angry");
                        } else if(weekdayKeyArray[i].moodOfPost === "Jealous") {
                            moodOfDay.classList.add("jealous");
                        } else if(weekdayKeyArray[i].moodOfPost === "Couragious") {
                            moodOfDay.classList.add("couragious");
                        } else if(weekdayKeyArray[i].moodOfPost === "Fear") {
                            moodOfDay.classList.add("fear");
                        } else if(weekdayKeyArray[i].moodOfPost === "Forgiving") {
                            moodOfDay.classList.add("forgiving");
                        }
                    }
                }
            }  
        }
    } else {
        document.querySelector("div#weekdays").textContent = "Sorry, you don't have any logged feelings";
    } 
}

function renderSettingsPopup() {
    const main = document.querySelector("main");
    if(!document.querySelector("#overlay")) {
        let overlay = document.createElement("div");
        main.appendChild(overlay);
        overlay.setAttribute("id", "overlay");
    } else {
        document.querySelector("div#overlay").style.visibility = "visible";
    }
    
    let overlay = document.querySelector("div#overlay");
    overlay.innerHTML = `
    <div id="settingsHeader">
        <p>Settings</p>
        <button id="closeSettings">X</button></div>
    <div id="buttonOptions">
        <button class="usernameButton">Change username</button>
        <button class="passwordButton">Change password</button>
        <button class="deleteUserButton">Delete user</button>
        <button id="logout">Logout</button>
    </div>
    `;

    document.getElementById("logout").addEventListener("click", logout);
    document.getElementById("closeSettings").addEventListener("click", closeSettings);

    document.querySelector("button.usernameButton").addEventListener("click", renderUsernamePopup);
    document.querySelector("button.passwordButton").addEventListener("click", renderPasswordPopup);
    document.querySelector("button.deleteUserButton").addEventListener("click", renderDeleteAccountPopup);
}

function logout() {
    window.localStorage.setItem("loggedIn", "false");
    window.localStorage.removeItem("userId");
    renderHomePage();
}

function closeSettings() {
    document.getElementById("overlay").style.visibility = "collapse";
    if(document.querySelector("div.infoBox") !== null) {
        document.querySelector("div.infoBox").style.visibility = "collapse";
    }
}

function renderUsernamePopup() {

    if(!document.querySelector("div.infoBox")) {
        let typeInfoBox = document.createElement("div");
        document.getElementById("overlay").appendChild(typeInfoBox);
        typeInfoBox.classList.add("infoBox");
    } else {
        document.querySelector("div.infoBox").style.visibility = "visible";
    }

    let typeInfoBox = document.querySelector("div.infoBox");
    document.querySelector("button.usernameButton").disabled = true;

    typeInfoBox.innerHTML = `
    <label for="oldUsername">Type your old username:</label>
    <input id="oldUsername" placeholder="Existing username">
    <label for="password">Type your password:</label>
    <input id="password" placeholder="Password">
    <label for="newUsername">Type a new username:</label>
    <input id="newUsername" placeholder="New username">
    <button id="sendChanges">Save</button>
    `;

    document.querySelector("button#sendChanges").addEventListener("click", changeUsername);
    
}

async function changeUsername() {
    let existingUsername = document.querySelector("input#oldUsername").value;
    let password = document.querySelector("input#password").value;
    let newUsername = document.querySelector("input#newUsername").value;
    let userID = window.localStorage.getItem("userId");
    
    let requestDetails = {
        method: "PATCH",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({
            userID: userID,
            existingUsername: existingUsername,
            userPassword: password,
            action: "settings",
            newUsername: newUsername
    })};

    let response = await fetchAPI(false, requestDetails);

    if(!response.ok) {
        /*let resource = await response.json();
        if(!document.querySelector(".infoBox > .informUser")) {
            let informUser = document.createElement("p");
            document.querySelector("div.infoBox").appendChild(informUser);
            informUser.classList.add("informUser");
        } 

        let informUser = document.querySelector("p.informUser");
        informUser.textContent = resource.message;*/

        return;

    } 

    let resource = await response.json();
    let changedUsername = resource.newUsername;
    document.querySelector("div#profileUsername").textContent = changedUsername;
    document.querySelector("div.infoBox").style.visibility = "collapse";
    document.querySelector("button.usernameButton").disabled = false;

}

function renderPasswordPopup() {

}

function renderDeleteAccountPopup() {

}