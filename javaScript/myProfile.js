"use strict";

async function renderProfilePage() {

    // Select my Profile in Menu
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

    main.innerHTML = `
        <div id="profilePicture"></div>
        <div id="changeProfilePicture">
            <div id="randomIcon"></div>
        </div>
        <div id="profileUsername" class="fontYsabeu">${username}</div>
        <p id="calendarWeek"></p>
        <div id="calendarAndButtons">
            <button id="oneWeekBefore"><</button>
            <div id="calendar">
                <div id="weekdays">
                    <div id="mondayContainer"><p>Mo</p></div>
                    <div id="tuesdayContainer"><p>Tu</p></div>
                    <div id="wednesdayContainer"><p>We</p></div>
                    <div id="thursdayContainer"><p>Th</p></div>
                    <div id="fridayContainer"><p>Fr</p></div>
                    <div id="saturdayContainer"><p>Sa</p></div>
                    <div id="sundayContainer"><p>Su</p></div>
                </div>
                <p id="messageToUser"></p>
            </div>
            <button id="oneWeekAfter">></button>
        </div>
    `;

    document.querySelector("p#messageToUser").style.display = "none";
    document.querySelector("button#oneWeekBefore").addEventListener("click", findWeekForCalendar);
    document.querySelector("button#oneWeekAfter").addEventListener("click", findWeekForCalendar);

    let profilePictureDiv = document.getElementById("profilePicture");
    profilePictureDiv.style.backgroundImage = `url(${profilePicture})`;

    main.querySelector("#changeProfilePicture").addEventListener("click", changeProfilePicture);
    async function changeProfilePicture(){
        const userID = parseInt(window.localStorage.getItem("userId"));
        const userPassword = window.localStorage.getItem("userPassword");

        const requestOptions = {
            method: "PATCH",
            headers: {"Content-type": "application/json; charset=UTF-8"},
            body: JSON.stringify({
                userID: userID,
                userPassword: userPassword,
                action: "settings",
                settingsAction: "profilePicture"
            })
        }

        const response = await fetchAPI(false, requestOptions);
        if(!response.ok){
            alert("Something went wrong, please try again.");
        }else{
            const newProfilePicture = await response.json();
            profilePictureDiv.style.backgroundImage = `url(${newProfilePicture})`;
        }
    }

    //Remove classes from other pages
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
    main.classList.remove("noScroll");
    

    let divs = document.querySelectorAll(".profileHeader > div");

    for(let i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }

    if(!document.querySelector("div#settingsButton")) {
        let settingsButton = document.createElement("div");
        header.appendChild(settingsButton);
        settingsButton.setAttribute("id", "settingsButton");
    }

    settingsButton.addEventListener("click", renderSettingsPopup);

    getDatesBasedOnToday();
}

function getDatesBasedOnToday() {
    let year = new Date().getFullYear();
    let dateOfTheMonth = new Date().getDate();
    
    let month = "";
    let endOfMonth = "";
    let lastMonth = "";
    let nextMonth = "";
    let endOfLastMonth = "";


    switch(new Date().getMonth()) {
        case 0:
            month = "January";
            endOfMonth = 31;
            lastMonth = "December";
            endOfLastMonth = 31;
            nextMonth = "February";
            break;
        case 1:
            month = "February";
            endOfMonth = 28;
            lastMonth = "January";
            endOfLastMonth = 31;
            nextMonth = "March";
            break;
        case 2:
            month = "March";
            endOfMonth = 31;
            lastMonth = "February";
            endOfLastMonth = 28;
            nextMonth = "April";
            break;
        case 3:
            month = "April";
            endOfMonth = 30;
            lastMonth = "March";
            endOfLastMonth = 31;
            nextMonth = "May";
            break;
        case 4: 
            month = "May";
            endOfMonth = 31;
            lastMonth = "April";
            endOfLastMonth = 30;
            nextMonth = "June";
            break;
        case 5: 
            month = "June";
            endOfMonth = 30;
            lastMonth = "May";
            endOfLastMonth = 31;
            nextMonth = "July";
            break;
        case 6:
            month = "July";
            endOfMonth = 31;
            lastMonth = "June";
            endOfLastMonth = 30;
            nextMonth = "August";
            break;
        case 7:
            month = "August";
            endOfMonth = 31;
            lastMonth = "July";
            endOfLastMonth = 31;
            nextMonth = "September";
            break;
        case 8: 
            month = "September";
            endOfMonth = 30;
            lastMonth = "August";
            endOfLastMonth = 31;
            nextMonth = "October";
            break;
        case 9: 
            month = "October";
            endOfMonth = 31;
            lastMonth = "September";
            endOfLastMonth = 30;
            nextMonth = "November";
            break;
        case 10:
            month = "November";
            endOfMonth = 30;
            lastMonth = "October";
            endOfLastMonth = 31;
            nextMonth = "December";
            break;
        case 11:
            month = "December";
            endOfMonth = 31;
            lastMonth = "November";
            endOfLastMonth = 30;
            nextMonth = "January";
            break;
    }

    let beginningOfWeek = "";
    let endOfWeek = "";

    switch(new Date().getDay()) {
        case 0:
            beginningOfWeek = dateOfTheMonth - 6;
            endOfWeek = dateOfTheMonth;
            break;
        case 1:
            beginningOfWeek = dateOfTheMonth;
            endOfWeek = dateOfTheMonth + 6;
            break;
        case 2:
            beginningOfWeek = dateOfTheMonth - 1;
            endOfWeek = dateOfTheMonth + 5;
            break;
        case 3:
            beginningOfWeek = dateOfTheMonth - 2;
            endOfWeek = dateOfTheMonth + 4;
            break;
        case 4: 
            beginningOfWeek = dateOfTheMonth - 3;
            endOfWeek = dateOfTheMonth + 3;
            break;
        case 5: 
            beginningOfWeek = dateOfTheMonth - 4;
            endOfWeek = dateOfTheMonth + 2;
            break;
        case 6:
            beginningOfWeek = dateOfTheMonth - 5;
            endOfWeek = dateOfTheMonth + 1;
            break;
    }

    makeWeekIntoArray(beginningOfWeek, endOfWeek, month, endOfMonth, lastMonth, endOfLastMonth, nextMonth, year);
}

async function makeWeekIntoArray(beginningOfWeek, endOfWeek, month, endOfMonth, lastMonth, endOfLastMonth, nextMonth, year) {
    let userPassword = window.localStorage.getItem("userPassword");
    let userId = window.localStorage.getItem("userId");
   
    let requestDetails = {
        method: "POST",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({
            userID: userId,
            userPassword: userPassword,
            action: "myProfile"
    })};

    let response = await fetchAPI(false, requestDetails, false);
    if(!response.ok) {
        document.querySelector("p#messageToUser").style.display = "block";
        let resource = await response.json();
        document.querySelector("p#messageToUser").textContent = resource.message;
    }

    let resource = await response.json();
    let storedMoods = resource.storedMoods;
    let postsOfUser = resource.postsOfUser;

    let beginningOfWeekInt = parseInt(beginningOfWeek);
    let endOfWeekInt = parseInt(endOfWeek);
    let arrayOfWeekDates = [];
    let intoLastMonth;
    let intoNextMonth;
    let week;

    //Push dates into array
    for(let i = beginningOfWeekInt; i <= endOfWeekInt; i++) {
        arrayOfWeekDates.push(i);
    }

    //Delete array element dates that are not valid
    for(let i = 0; i < arrayOfWeekDates.length; i++) {
        if(arrayOfWeekDates[i].toString() === "0" || arrayOfWeekDates[i].toString().includes("-")) {
            arrayOfWeekDates.splice(i, 1);
            intoLastMonth = true;
            i = i - 1;
        } else if(arrayOfWeekDates[i] === endOfMonth) {
            intoNextMonth = true;
            arrayOfWeekDates.splice(i + 1);
            break;
        }
    }

    //Place correct dates into array and make week
    if(intoLastMonth !== undefined) {
        arrayOfWeekDates.unshift(endOfLastMonth);
        while(arrayOfWeekDates.length < 7) {
            let yesterday = arrayOfWeekDates[0] - 1;
            arrayOfWeekDates.unshift(yesterday);
        }

        beginningOfWeek = arrayOfWeekDates[0];
        endOfWeek = arrayOfWeekDates[arrayOfWeekDates.length - 1];

        if(lastMonth === "December") {
            week = `${lastMonth} - ${month} ${beginningOfWeek} - ${endOfWeek}, ${year-1}-${year}`;
            prepareCalendar(postsOfUser, month, storedMoods, week, arrayOfWeekDates);
            return;
        }
        week = `${lastMonth} - ${month} ${beginningOfWeek} - ${endOfWeek}, ${year}`;
        prepareCalendar(postsOfUser, month, storedMoods, week, arrayOfWeekDates);

    } else if(intoNextMonth !== undefined) {
        let date = 1;
        while(arrayOfWeekDates.length < 7) {
            arrayOfWeekDates.push(date);
            date = date + 1;
        }

        beginningOfWeek = arrayOfWeekDates[0];
        endOfWeek = arrayOfWeekDates[arrayOfWeekDates.length - 1];

        if(nextMonth === "January") {
            week = `${month} - ${nextMonth} ${beginningOfWeek} - ${endOfWeek}, ${year}-${year+1}`;
            prepareCalendar(postsOfUser, month, storedMoods, week, arrayOfWeekDates);
            return;
        }
        week = `${month} - ${nextMonth} ${beginningOfWeek} - ${endOfWeek}, ${year}`;
        prepareCalendar(postsOfUser, month, storedMoods, week, arrayOfWeekDates);

    } else {
        week = `${month} ${beginningOfWeek} - ${endOfWeek}, ${year}`;
        prepareCalendar(postsOfUser, month, storedMoods, week, arrayOfWeekDates);

    }
}

function prepareCalendar(arrayOfPosts, month, storedMoods, week, arrayOfWeekDates) {
    if(document.querySelector("#calendarWeek")) {
        document.querySelector("#calendarWeek").textContent = week;
    }

    let weekExists = false;
    for(let i = 0; i < storedMoods.length; i++) {
        if(storedMoods[i].week === week) {
            weekExists = true;
        }
    }

    //If week doesn't exist, store it as an object
    if(weekExists === false) {   
        let weekId = storedMoods.length + 1;                 
        storedMoods.push({
            week: week,
            weekId: weekId
        });
    }
    
    //Check if there are any new posts for current week, if so place them in week object
    let currentMonthPosts = [];
    for(let i = 0; i < arrayOfPosts.length; i++) {
        let postObject = arrayOfPosts[i];
        let postTimestamp = postObject.timestamp;

        if(postTimestamp.includes(month)) {
            currentMonthPosts.push(postObject);
        }
    }

    for(let i = 0; i < arrayOfWeekDates.length; i++) {
        let dayCounter = arrayOfWeekDates[i];
        for(let i = 0; i < currentMonthPosts.length; i++) {
            let timestampOfPost = currentMonthPosts[i].timestamp;
            let dayOfPosting = currentMonthPosts[i].dayOfWeek;
            let moodOfPost = currentMonthPosts[i].mood;
            let postId = currentMonthPosts[i].postID;

            if(moodOfPost === null || moodOfPost === "") {
                continue;
            }

            if(timestampOfPost.includes(` ${dayCounter} `)) {
                for(let i = 0; i < storedMoods.length; i++) {
                    if(storedMoods[i].week === week) {
                        let postAlreadyExists = false;
                        let weekMoods = storedMoods[i];

                        for(let key in weekMoods) {
                            if(key === "week" || key === "weekId") {
                                continue;
                            }
                          
                            let postObject = weekMoods[key];
                            if(postObject.postId === postId) {
                                postAlreadyExists = true;
                            }
                        }
                        if(!postAlreadyExists) {
                            storedMoods[i][`post${postId}`] = 
                            {
                                postId: postId,
                                dayOfWeek: dayOfPosting,
                                moodOfPost: moodOfPost
                            }
                        }
                    }
                }
            } 
        }
    }

    //If user clicked on profile button, load profile through function call
    let rightWeek = week;
    if(document.querySelector(".mainProfile") !== null) {
        displayRightWeek(rightWeek, storedMoods);
    }

    let userPassword = window.localStorage.getItem("userPassword");
    let userId = window.localStorage.getItem("userId");

    //Send potentially changed loggedFeelings array to server so that it can be stored
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

async function findWeekForCalendar(event) {
    //This function gets called when user clicks on calendar buttons
    document.querySelector("button#oneWeekAfter").disabled = false;
    document.querySelector("button#oneWeekBefore").disabled = false;
    document.querySelector("p#messageToUser").style.display = "none";


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
    let idOfButton = event.originalTarget.id;    
    
    //Finds right week in storedMoods array based on value of class attribute for week paragraph
    //Calls function displayRightWeek
    if(idOfButton === "oneWeekBefore") {
        let currentWeekIdString = event.originalTarget.parentElement.previousElementSibling.classList[0];
        let currentWeekId = parseInt(currentWeekIdString);
        let storedMoodsArray = resource.storedMoods;
        let idOfWantedWeek;

        for(let i = 0; i < storedMoodsArray.length; i++) {
            let weekIdInArray = storedMoodsArray[i].weekId;
            if(currentWeekId === weekIdInArray) {
                let idOfCurrentWeek = weekIdInArray;
                idOfWantedWeek = idOfCurrentWeek - 1;
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
        let currentWeekIdString = event.originalTarget.parentElement.previousElementSibling.classList[0];
        let currentWeekId = parseInt(currentWeekIdString);
        let storedMoodsArray = resource.storedMoods;
        let idOfWantedWeek;

        for(let i = 0; i < storedMoodsArray.length; i++) {
            let weekIdInArray = storedMoodsArray[i].weekId;
            if(weekIdInArray === currentWeekId) {
                idOfWantedWeek = currentWeekId + 1;
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
    }
}

function displayRightWeek(rightWeek, storedMoods) {
    document.querySelector("p#messageToUser").style.display = "none";

    let weekdaysContainer = document.querySelector("div#weekdays");
    weekdaysContainer.innerHTML = `
        <div id="mondayContainer">
            <p>Mo</p>
        </div>
        <div id="tuesdayContainer">
            <p>Tu</p>
        </div>
        <div id="wednesdayContainer">
            <p>We</p>
        </div>
        <div id="thursdayContainer">
            <p>Th</p>
        </div>
        <div id="fridayContainer">
            <p>Fr</p>
        </div>
        <div id="saturdayContainer">
            <p>Sa</p>
        </div>
        <div id="sundayContainer">
            <p>Su</p>
        </div>
    `;

    //Removes the today class for all weekday paragraphs
    let weekdaysParagraphs = document.querySelectorAll("#weekdays div > p");
    for(let i = 0; i < weekdaysParagraphs.length; i++) {
        if(weekdaysParagraphs[i].classList.contains("today")) {
            weekdaysParagraphs[i].removeAttribute("class");
            
        }
    }

    //Finds right week in storedMoods, displays moods if there are any
    for(let i = 0; i < storedMoods.length; i++) {
        if(storedMoods[i].week === rightWeek) {
            let rightArrayObject = storedMoods[i];
            let postsExistForWeek = false;
            for(let key in rightArrayObject) {
                if(key.includes("post")) {
                    postsExistForWeek = true;
                }
            }

            if(!postsExistForWeek) {
                document.querySelector("p#messageToUser").style.display = "block";
                document.querySelector("p#messageToUser").textContent = "No logged feelings this week";
                let weekId = storedMoods[i].weekId;
                document.querySelector("#calendarWeek").setAttribute("class", `${weekId}`);
                document.querySelector("#calendarWeek").textContent = `${rightWeek}`;
            } else {
                let weekId = storedMoods[i].weekId;
                document.querySelector("#calendarWeek").setAttribute("class", `${weekId}`);
                document.querySelector("#calendarWeek").textContent = `${rightWeek}`;
                let weekMoods = storedMoods[i];
                let rightDay;
        
                for(let key in weekMoods) {
                    if(key === "week" || key === "weekId") {
                        continue;
                    }
    
                    let dayOfWeek = weekMoods[key].dayOfWeek;
                    let firstTwoWords = dayOfWeek.substring(0, 2);
                    
                    let weekdays = document.querySelectorAll("#weekdays > div > p");
                    for(let i = 0; i < weekdays.length; i++) {
                        if(firstTwoWords === weekdays[i].textContent) {
                            rightDay = weekdays[i];
                        }
                    }       
                    
                    let moodOfPost = weekMoods[key].moodOfPost;
                    let parentOfParagraph = rightDay.parentNode;
                    let moodOfDay = document.createElement("div");
                    parentOfParagraph.appendChild(moodOfDay);
                    moodOfDay.classList.add("feeling");
    
                    switch(moodOfPost) {
                        case "Happy":
                            moodOfDay.classList.add("happy");
                            break;
                        case "Sad":
                            moodOfDay.classList.add("sad");
                            break;
                        case "Angry":
                            moodOfDay.classList.add("angry");
                            break;
                        case "Jealous":
                            moodOfDay.classList.add("jealous");
                            break;
                        case "Courageous":
                            moodOfDay.classList.add("courageous");
                            break;
                        case "Fear":
                            moodOfDay.classList.add("fear");
                            break;
                        case "Forgiving":
                            moodOfDay.classList.add("forgiving");
                            break;
                        case "Alone":
                            moodOfDay.classList.add("alone");
                            break;
                        case "Funny":
                            moodOfDay.classList.add("funny");
                            break;
                    }
    
                    moodOfDay.addEventListener("click", event => {
                        if(document.querySelector(".moodPopup")){
                            document.querySelector(".moodPopup").remove();
                        }
                        
                        const moodPopup = document.createElement("div");
                        moodPopup.innerHTML = `
                            <div class="popupContainer">
                                <div>This color means: <br>${moodOfPost}</div>
                            </div>
                        `
                        moodPopup.classList.add("moodPopup");
                        document.querySelector("#calendar").appendChild(moodPopup);
                        setTimeout(function(){
                            moodPopup.remove();
                        }, 2500)
                    })
                }
            }
        }  
    }

    //Checks which calendar buttons that should be disabled based on if there are any more weeks
    let idOfCurrentWeek = document.querySelector("p#calendarWeek").classList[0];
    document.querySelector("button#oneWeekBefore").removeAttribute("title");
    document.querySelector("button#oneWeekAfter").removeAttribute("title");
    document.querySelector("button#oneWeekBefore").disabled = false;
    document.querySelector("button#oneWeekAfter").disabled = false;

    if(parseInt(idOfCurrentWeek) === storedMoods.length) {
        let today = getToday();
        for(let i = 0; i < weekdaysParagraphs.length; i++) {
            if(weekdaysParagraphs[i].textContent === today) {
                weekdaysParagraphs[i].classList.add("today");
            }
        }

        document.querySelector("button#oneWeekAfter").disabled = true;
        document.querySelector("button#oneWeekAfter").setAttribute("title", "No later logged weeks");

        if(parseInt(idOfCurrentWeek) === 1) {
            document.querySelector("button#oneWeekBefore").disabled = true;
            document.querySelector("button#oneWeekBefore").setAttribute("title", "No previous logged weeks");
        }
    } else if(parseInt(idOfCurrentWeek) === 1) {
        document.querySelector("button#oneWeekBefore").disabled = true;
        document.querySelector("button#oneWeekBefore").setAttribute("title", "No previous logged weeks");
    } 
}

function getToday() {
    let today = "";

    switch(new Date().getDay()) {
        case 0:
            today = "Su";
            break;
        case 1:
            today = "Mo";
            break;
        case 2:
            today = "Tu";
            break;
        case 3:
            today = "We";
            break;
        case 4: 
            today = "Th";
            break;
        case 5: 
            today = "Fr";
            break;
        case 6:
            today = "Sa";
            break;
    }

    return today;
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
            <div id="closeSettings"></div>
        </div>
        <div id="buttonOptions">
            <button class="usernameButton">Change username</button>
            <button class="passwordButton">Change password</button>
            <button class="deleteUserButton">Delete user</button>
            <button id="logout">Logout</button>
        </div>
    `;
    document.querySelector("#overlay").scrollIntoView();
    document.querySelector("body.profileBody").style.overflow = "hidden";
    
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
    document.querySelector("body.profileBody").style.overflow = "scroll";
    if(document.querySelector("div.infoBox") !== null) {
        document.querySelector("div.infoBox").style.visibility = "collapse";
    }
}

function renderUsernamePopup() {
    let currentlyActive = document.querySelector("button.usernameButton");
    enableButtons(currentlyActive);
    if(!document.querySelector("div.infoBox")) {
        let typeInfoBox = document.createElement("div");
        document.getElementById("overlay").appendChild(typeInfoBox);
        typeInfoBox.classList.add("infoBox");
    } else {
        document.querySelector("div.infoBox").style.visibility = "visible";
    }

    let typeInfoBox = document.querySelector("div.infoBox");
    typeInfoBox.setAttribute("id", "changeUsername");

    typeInfoBox.innerHTML = `
        <div id="closeInfoBox"></div>
        <label class="first" for="username">Type your current username:</label>
        <input id="username" placeholder="Current username">
        <label for="password">Type your password:</label>
        <input id="password" type="password" placeholder="Password">
        <label for="newUsername">Type your new username:</label>
        <input id="newUsername" placeholder="New username">
        <button id="sendChanges">Save</button>
    `;

    document.querySelector("button#sendChanges").addEventListener("touchstart", makeAccountChanges);
    document.querySelector("button#sendChanges").addEventListener("click", makeAccountChanges);
    document.querySelector("div#closeInfoBox").addEventListener("click", closeInfoBox);
    
}

function renderPasswordPopup() {
    let currentlyActive = document.querySelector("button.passwordButton");
    enableButtons(currentlyActive);

    if(!document.querySelector("div.infoBox")) {
        let typeInfoBox = document.createElement("div");
        document.getElementById("overlay").appendChild(typeInfoBox);
        typeInfoBox.classList.add("infoBox");
    } else {
        document.querySelector("div.infoBox").style.visibility = "visible";
    }

    let typeInfoBox = document.querySelector("div.infoBox");
    typeInfoBox.setAttribute("id", "changePassword");

    typeInfoBox.innerHTML = `
        <div id="closeInfoBox"></div>
        <label class="first" for="username">Type your username:</label>
        <input id="username" placeholder="Username">
        <label for="password">Type your current password:</label>
        <input id="password" type="password" placeholder="Password">
        <label for="newPassword">Type your new password:</label>
        <input id="newPassword" type="password" placeholder="New password">
        <label for="newPassword">Type your new password again:</label>
        <input id="newPasswordCopy" type="password" placeholder="New password">
        <button id="sendChanges">Save</button>
    `;

    document.querySelector("button#sendChanges").addEventListener("touchstart", makeAccountChanges);
    document.querySelector("button#sendChanges").addEventListener("click", makeAccountChanges);
    document.querySelector("div#closeInfoBox").addEventListener("click", closeInfoBox);

}

function renderDeleteAccountPopup() {
    let currentlyActive = document.querySelector("button.deleteUserButton");
    enableButtons(currentlyActive);

    if(!document.querySelector("div.infoBox")) {
        let typeInfoBox = document.createElement("div");
        document.getElementById("overlay").appendChild(typeInfoBox);
        typeInfoBox.classList.add("infoBox");
    } else {
        document.querySelector("div.infoBox").style.visibility = "visible";
    }

    let typeInfoBox = document.querySelector("div.infoBox");
    typeInfoBox.setAttribute("id", "deleteAccount");
    typeInfoBox.innerHTML = `
        <div id="closeInfoBox"></div>
        <label class="first" for="username">Type your username:</label>
        <input id="username" placeholder="Username">
        <label for="password">Type your password:</label>
        <input id="password" type="password" placeholder="Password">
        <button id="sendChanges">Delete account</button>
    `;

    document.querySelector("button#sendChanges").addEventListener("touchstart", makeAccountChanges);
    document.querySelector("button#sendChanges").addEventListener("click", makeAccountChanges);
    document.querySelector("div#closeInfoBox").addEventListener("click", closeInfoBox);

}

function enableButtons(exceptFor) {
    //Enables the settings buttons. Except for the one sent as argument, if it was sent
    let allButtons = document.querySelectorAll("div#overlay > #buttonOptions > button");
    for(let i = 0; i < allButtons.length; i++) {
        if(allButtons[i] === exceptFor) {
            allButtons[i].disabled = true;
            continue;
        }

        allButtons[i].disabled = false;
    }
}

function closeInfoBox() {
    document.querySelector("div.infoBox").style.visibility = "collapse";
    enableButtons();

}

async function makeAccountChanges(event) {
    let infoBoxId = event.originalTarget.parentElement.id;
    let userID = window.localStorage.getItem("userId");
    let requestDetails;

    //Sends changes to server based on which id the div has
    if(infoBoxId === "changeUsername") {
        let username = document.querySelector("input#username").value;
        let password = document.querySelector("input#password").value;
        let newUsername = document.querySelector("input#newUsername").value;
    
        requestDetails = {
            method: "PATCH",
            headers: {"Content-type": "application/json; charset=UTF-8"},
            body: JSON.stringify({
                userID: userID,
                username: username,
                userPassword: password,
                action: "settings",
                newUsername: newUsername
            })
        };

    } else if(infoBoxId === "changePassword") {
        let username = document.querySelector("input#username").value;
        let password = document.querySelector("input#password").value;
        let newPassword = document.querySelector("input#newPassword").value;
        let newPasswordCopy = document.querySelector("input#newPasswordCopy").value;

        requestDetails = {
            method: "PATCH",
            headers: {"Content-type": "application/json; charset=UTF-8"},
            body: JSON.stringify({
                userID: userID,
                username: username,
                userPassword: password,
                action: "settings",
                newPassword: newPassword,
                newPasswordCopy: newPasswordCopy
            })
        };

    } else if(infoBoxId === "deleteAccount") {
        let wantsToDelete = confirm("Are you sure that you want to delete your account?\nIf so, press OK");
        if(wantsToDelete) {
            let username = document.querySelector("input#username").value;
            let password = document.querySelector("input#password").value;

            requestDetails = {
                method: "DELETE",
                headers: {"Content-type": "application/json; charset=UTF-8"},
                body: JSON.stringify({
                    userID: userID,
                    username: username,
                    userPassword: password,
                    action: "settings",
                })
            };
        } else {
            return;
        }
    }


    let response = await fetchAPI(false, requestDetails);

    if(!response.ok) {
        let resource = await response.json();
        if(!document.querySelector("div.infoBox > .informUser")) {
            let informUser = document.createElement("p");
            document.querySelector("div.infoBox").appendChild(informUser);
            informUser.classList.add("informUser");
        } 

        let informUser = document.querySelector("p.informUser");
        informUser.textContent = resource.message;

        return;

    } 

    let resource = await response.json();

    //If username was changed do something, else if account was deleted do something else
    if(resource.newUsername) {
        document.querySelector("div#profileUsername").textContent = resource.newUsername;
    } else if(resource.deletedAccount) {
        window.localStorage.setItem("loggedIn", "false");
        window.localStorage.removeItem("userId");

        document.querySelector("div.infoBox").innerHTML = `
            <p id="aboutAccount">${resource.message}</p>
        `;

        setTimeout(renderHomePage, 4500);
        return;
    }
    
    //Tell the user that changes were successful
    document.querySelector("div.infoBox").removeAttribute("id");
    document.querySelector("div.infoBox").innerHTML = `
        <div id="closeInfoBox"></div>
        <p>${resource.message}</p>
    `;

    document.querySelector("div.infoBox > p").style.marginBottom = "11px";
    document.querySelector("div.infoBox > p").style.fontSize = "14.5px";


    document.querySelector("div#closeInfoBox").addEventListener("click", closeInfoBox);
    enableButtons();

}