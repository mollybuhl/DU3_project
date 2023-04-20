async function renderLoginPage() {
    
    let main = document.querySelector("main");
    main.innerHTML = `
    <input type="text" id="loginUsername"><input>
    <input type="password" id="loginPassword"><input>
    <button>Login</button>
    `;

    const username = document.querySelector("loginUsername").value;
    const password = docuement.querySelector("#loginPassword").value;

    let response = await fetch("../php/login.php", {
        method: "POST",
        headers: {"Content-type": "application/json; charset=UTF-8"},
        body: JSON.stringify({
            username: username,
            password: password
        })
    });

    let resource = await response.json();

    if(!response.ok) {
        //Message from server?
    }
}

