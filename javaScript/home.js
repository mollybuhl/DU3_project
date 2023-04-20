
function renderHomePage(){
    let main = document.querySelector("main");
    let header = document.querySelector("header");
    let footer = document.querySelector("footer");

    header.classList.add("home");
    header.innerHTML = `
    <h3 class="logo">MoodMate</h3>
    <button class="loginButton">LOGIN</button>`

    main.innerHTML =`
    <div class="introduction">
        <h4>Share your mood</h4>
        <h1>Build a deeper connection with your frinds</h1>

        <p>Share your daily emotions with your friends and build a deeper understanding for eachother.
        Stay on top of your own mental health by keeping track on your own mood over time.</p>
        <button class="registerButton">Register</p>
    </div>

    <div class="guide">
        <h2>How it works</h3>
        <h4>1. Rate your current mood</h4>
        <p>Select the feeling that best fit you right now<p>
        <p>IMAGE</p>
        <h4>2. Describe your Feelings</h4>
        <p>Try to explain why you are feeling this way</p>
        <p>IMAGE</p>
        <h4>3. Share with Friends</h4>
        <p>Share your mood with your frinds and have a look at how they're feeling </p>
        <p>IMAGE</p>
        <h4>4. Track your progress</h4>
        <p>Keep track on how your mood changes over time with weekly and monthly statistics</p>
        <p>IMAGE</p>

        <button class="registerButton">Get Started</p>
    </div>
    `;

    let registerButtons = document.querySelectorAll(".registerButton");
    registerButtons.forEach(registerButton => {
        registerButton.addEventListener("click", renderRegisterPage());
    });

    document.querySelector(".loginButton").addEventListener("click", renderLoginPage());

    footer.innerHTML = `
        <h4 class="logo">MoodMate</h4>
        <p>This page is for education purposes only</p>
    `;
}

