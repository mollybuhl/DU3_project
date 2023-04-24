"use strict";

function renderPostingModal(){
    const postMoodModal = document.createElement("div");

    postMoodModal.innerHTML = `
    <div id="feelings">
        <button>Sad</button>
        <button>Happy</button>
        <button>Angry</button>
        <button>Couragious</button>
        <button>Forgiving</button>
        <button>Jealous</button>
        <button>Fear</button>
    </div>
    <label for="description">Let your friends know why you feel this way</label>
    <input id="description" type="text" name="description">
    <div id="quote"></div>
    <button id="quoteButton">Generate quote</button>
    <button id="postFeeling">Share feeling :)</button>
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
}

let userID = 1; /* Recieve from localstorage once its implemented */
let mood = "";
let apiCategory = "";
let quote = "Houston, we have a problem"; /* Using this until the Quotes API is implemented */


async function fetchQuote(){
    // This function will fetch a quote once we figure out the quotes API :)
}

async function postFeeling(){
    const description = document.querySelector("#description").value;

    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            id: 1,
            mood: mood,
            description: description,
            quote: quote
        })
    }
    
    const request = new Request("../php/sharemood.php", requestOptions);
    let response = await fetch(request);
    let resource = await response.json();
}