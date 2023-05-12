/* 
isGET = true or false
requestOptions = if it's a GET request, this should be a string with GET parameters. Any other method should be an ordinary options object
createFetchModal = if true, create a modal informing that its fetching information, if false, don't create a modal.
*/

async function fetchAPI(isGET, requestOptions, createFetchModal = true){
    const body = document.querySelector("body");
    if(createFetchModal){
        const fetchModal = document.createElement("div");
        fetchModal.classList.add("fetchModal");
        fetchModal.innerHTML = `
        <div>
            <div>Fetching information...</div>
        </div>
        `
        body.appendChild(fetchModal);
    }
    try{
        let request;
        if(isGET){
            request = new Request("php/api.php?" + requestOptions);
        }else{
            request = new Request("php/api.php", requestOptions);
        }
        const response = await fetch(request);
    
        if(!response.ok){
            if(body.querySelector(".fetchModal") === null){
                const fetchModal = document.createElement("div");
                fetchModal.classList.add("fetchModal");
                body.appendChild(fetchModal);
            }
            
            const fetchModal = body.querySelector(".fetchModal")
            fetchModal.innerHTML = `
            <div>
                <div>Sorry something went wrong, please try again.</div>
                <button>Close</button>
            </div>
            `
            fetchModal.querySelector("div > button").addEventListener("click", event => fetchModal.remove());

            return response;
        }else{
            body.querySelector(".fetchModal").remove();
            return response;
        }
    }catch(error){
        // Display the error with a popup
    }
}