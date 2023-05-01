"use strict";

let userID = parseInt(window.localStorage.getItem("userId"));
let mood = "";
let apiCategory = "";
let quote;

function renderPostingModal(){
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
        quote = await resource;
        
        const quoteDiv = postMoodModal.querySelector("#quote > p");
        quoteDiv.textContent = quote[0]["quote"];
    }
}

async function postFeeling(){

    const description = document.querySelector("#description").value;

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: userID,
            mood: mood,
            description: description,
            quote: quote
        })
    }
    
    const request = new Request("../php/sharemood.php", requestOptions);
    let response = await fetch(request);
    let resource = await response.json();

    document.querySelector(".moodModal").classList.add("hidden");
    renderFeedPage();
}