"use strict";

function renderPostingModal(){
    const userID = parseInt(window.localStorage.getItem("userId"));
    const userPassword = window.localStorage.getItem("userPassword");

    document.querySelector(".footerFeed > div > .chatButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .feedButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .profileButton").parentElement.classList.remove("selected");
    document.querySelector(".footerFeed > div > .postButton").parentElement.classList.add("selected");


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
    </div>
    <h3>Why you feel this way</h3>
    <input id="description" type="text" name="description" placeholder="I'm feeling like this because..">
    <div id="quote">
        <p id="generatedQuote"></p>
        <button id="quoteButton">Generate quote</button>
    </div>
    <button id="postFeeling">Share feelings :)</button>
    `

    const feelingsButtons = postMoodModal.querySelectorAll("#feelings > button");

    feelingsButtons.forEach(button => {
        button.addEventListener("click", event => {

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
            }

        });
    })

    document.querySelector("main").appendChild(postMoodModal);
    postMoodModal.querySelector("#quoteButton").addEventListener("click", fetchQuote);
    postMoodModal.querySelector("#postFeeling").addEventListener("click", postFeeling);

    async function fetchQuote(){
        const request = new Request(`https://api.api-ninjas.com/v1/quotes?category=${apiCategory}`, {
            headers: {"X-Api-Key": "LXZX6kL0y3UveciOxVZfHw==emA1EeSTrBmKlT1R"}
        })
        const response = await fetch(request);
        const resource = await response.json();
        quoteObject = await resource[0];
        const quoteDiv = postMoodModal.querySelector("#quote");
        quoteDiv.textContent = quoteObject.quote;
    }

    async function postFeeling(){
        const date = new Date();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const months = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "June", "July", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];
    
        let timestamp = `${date.getHours()}:${date.getMinutes()}, ${date.getDate()} ${months[date.getMonth()]}`
        let dayOfWeek = weekdays[date.getDay()];
    
        const description = document.querySelector("#description").value;
    
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
        
        const response = await fetchAPI(false, requestOptions);
        const resource = await response.json();
    
        postMoodModal.remove();
        renderFeedPage();
    }
}

