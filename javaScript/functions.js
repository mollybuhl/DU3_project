async function fetchAPI(request){
    const response = await fetch(request);
    return await response.json();
}