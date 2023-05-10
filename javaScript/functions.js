/* 
isGET = true or false
requestOptions = if it's a GET request, this should be a string with GET parameters. Any other method should be an ordinary options object
*/

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