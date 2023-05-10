async function fetchAPI(isGET, requestOptions){
    try{
        let request;
        if(isGET){
            request = new Request("php/api.php?" + requestOptions);
        }else{
            request = new Request("php/api.php", requestOptions);
        }
        const response = await fetch(request);
        return response;
    }catch(error){
        // Display the error with a popup
    }
}