
function renderHomePage(){
    let main = document.querySelector("main");
    let header = document.querySelector("header");

    header.classList.add("home");
    header.innerHTML = `
    <h3>NAME</h3>
    <button class="login">LOGIN</button>`

    main.innerHTML =`
    <h1>NAME</h1>
    <h3>Build a stronger connection with your frinds</h3>
    <p>Share your daily mood with your friends</p>
    <button>REGISTER</button>
    `;
}