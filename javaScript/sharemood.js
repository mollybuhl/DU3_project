"use strict";

function renderPostingModal(){
    const userID = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword");

    document.querySelector(".footerFeed > div > .chatButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .feedButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .profileButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .postButton").parentElement.classList.add("selected");

    document.querySelector("body").classList.add("noScroll");


    let mood;
    let apiCategory;
    let quoteObject;

    const postMoodModal = document.createElement("div");
    postMoodModal.classList.add("moodModal");

    postMoodModal.innerHTML = `
    <h2>How are you currently feeling?</h2>
    <div id="feelings">
        <button class="sad">Sad</button>
        <button class="happy">Happy</button>
        <button class="angry">Angry</button>
        <button class="couragious">Couragious</button>
        <button class="forgiving">Forgiving</button>
        <button class="jealous">Jealous</button>
        <button class="fear">Fear</button>
        <button class="alone">Alone</button>
        <button class="funny">Funny</button>
    </div>
    <h3>Why you feel this way?</h3>
    <input id="description" type="text" name="description" placeholder="I'm feeling like this because..">
    <div id="quote">
        <p id="generatedQuote"></p>
        <button id="quoteButton">Generate quote</button>
    </div>
    <div class="shareMoodFeedbackMessage"></div>
    <button id="postFeeling">Share feelings</button>
    `

    const feelingsButtons = postMoodModal.querySelectorAll("#feelings > button");

    feelingsButtons.forEach(button => {
        button.addEventListener("click", event => {

            feelingsButtons.forEach(button =>{
                button.classList.remove("selected");
            })
            button.classList.add("selected");

            mood = button.textContent;
            switch(mood){
                case "Sad":
                    apiCategory = "inspirational";
                    break;
                case "Happy":
                    apiCategory = "happiness";
                    break;
                case "Angry":
                    apiCategory = "anger";
                    break;
                case "Couragious":
                    apiCategory = "courage";
                    break;
                case "Forgiving":
                    apiCategory = "forgiveness";
                    break;
                case "Jealous":
                    apiCategory = "jealousy";
                    break;
                case "Fear":
                    apiCategory = "fear";
                    break;
                case "Alone":
                    apiCategory = "alone";
                    break;
                case "Funny":
                    apiCategory = "funny";
                    break;
            }

        });
    })

    document.querySelector("main").appendChild(postMoodModal);
    postMoodModal.querySelector("#quoteButton").addEventListener("click", fetchQuote);
    postMoodModal.querySelector("#postFeeling").addEventListener("click", postFeeling);

    async function fetchQuote(){
        const quoteDiv = postMoodModal.querySelector("#quote > #generatedQuote");
        const body = document.querySelector("body");


        if(apiCategory === undefined){
            quoteDiv.textContent = "Please begin with selecting your current mood";
        }else{

            const fetchModal = document.createElement("div");
            fetchModal.classList.add("fetchModal");
            fetchModal.innerHTML = `
            <div>
                <div>Fetching quote...</div>
            </div>
            `
            body.appendChild(fetchModal);

            const request = new Request(`https://api.api-ninjas.com/v1/quotes?category=${apiCategory}`, {
                headers: {"X-Api-Key": "LXZX6kL0y3UveciOxVZfHw==emA1EeSTrBmKlT1R"}
            })
    
            try{
                const response = await fetch(request);
                const resource = await response.json();
                quoteObject = await resource[0];
        
                body.querySelector(".fetchModal").remove();

                if(!response.ok){
                    quoteDiv.textContent = resource.message;
                }else{
                    quoteDiv.textContent = quoteObject.quote;
                }
            }catch(error){
                body.querySelector(".fetchModal").remove();
                quoteDiv.textContent = "Something went wrong, please try again later";
            }
        }
    }

    async function postFeeling(){
        const date = new Date();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    
        let hours = `${date.getHours()}`;
        let minutes = `${date.getMinutes()}`;
        if(hours.length === 1){
            hours = `0${date.getHours()}`;
        }
        if(minutes.length === 1){
            minutes = `0${date.getMinutes()}`;
        }
        let timestamp = `${hours}:${minutes}, ${date.getDate()} ${months[date.getMonth()]}`
        let dayOfWeek = weekdays[date.getDay()];
    
        const description = document.querySelector("#description").value;

        if(quoteObject === undefined){
            postMoodModal.querySelector("#quote > #generatedQuote").textContent = "Please select a quote before posting";
        }else{

            if(confirm("Share Mood with Friends?")){
                const requestOptions = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({
                        action: "shareMood",
                        userID: userID,
                        userPassword: userPassword,
                        mood: mood,
                        description: description,
                        quote: quoteObject.quote,
                        dayOfWeek: dayOfWeek,
                        timestamp: timestamp
                    })
                }
        
                try{
                    const response = await fetchAPI(false, requestOptions);
                    const resource = await response.json();
                
                    if(!response.ok){
                        document.querySelector(".shareMoodFeedbackMessage").textContent = resource.message;
                    }else{
                        postMoodModal.remove();
                        storeMoodInArray();
                        renderFeedPage();
                    }
                }catch(error){
                    document.querySelector(".shareMoodFeedbackMessage").textContent = "Something went wrong, please try again later";
                }
            }
        }
    }
}

