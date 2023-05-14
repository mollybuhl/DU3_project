
function renderHomePage(){
    document.querySelector("body").removeAttribute("class");

    let main = document.querySelector("main");
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");

    header.removeAttribute("class");
    header.classList.add("headerHome");
    header.innerHTML = `
        <h3 class="logo">MoodMate</h3>
        <button class="loginButton">LOGIN</button>`;

    main.removeAttribute("class");
    main.classList.add("mainHome");

    main.innerHTML =`
    <div class="introduction">
        <h4>Share your mood</h4>
        <h1>Build a deeper connection with your frinds</h1>

        <p>Share your daily emotions with your friends and build a deeper understanding for eachother.
        Stay on top of your own mental health by keeping track on your own mood over time.</p>
        <button class="registerButton">Register</button>
        <div class="homeImage"></div>
    </div>

    <div class="guide">
        <h2>How it works</h3>
        <h3>1. Rate your current mood</h3>
        <p>Select the feeling that best fit you right now</p>
        <img src="../media/homePage/introPic1.png">
        <h3>2. Describe your Feelings</h3>
        <p>Try to explain why you are feeling this way</p>
        <img src="../media/homePage/introPic2.png">
        <h3>3. Share with Friends</h3>
        <p>Add your friends and see how they are feeling</p>
        <img src="../media/homePage/introPic3.png">
        <h3>4. Track your progress</h3>
        <p>Keep track on how your mood changes over time with weekly statistics</p>
        <img src="../media/homePage/introPic4.png">

        <button class="registerButton">Get Started</p>
    </div>
    `;

    let registerButtons = document.querySelectorAll(".registerButton");
    registerButtons.forEach(registerButton => {
        registerButton.addEventListener("click", renderRegisterPage);
    });

    document.querySelector(".loginButton").addEventListener("click", renderLoginPage);

    footer.removeAttribute("class");
    footer.classList.add("homeFooter");
    footer.innerHTML = `
        <h4 class="logo">MoodMate</h4>
        <p>This page is for education purposes only</p>
    `;

    document.querySelectorAll(".logo").forEach(logo => {
        logo.addEventListener("click", renderHomePage);
    });
}

