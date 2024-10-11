import axios from "axios";

async function ExecuteRequest(query, page): Promise<[]> {
    let response = await axios.get('https://api.scryfall.com/cards/search?page='+page+'&q='+query);
    let data = response.data;
    //if (response.data.has_more === true) {
    //    return data.concat(await ExecuteRequest(query, page++));
    //} else {
        return data;
    //}
}

export function onRequest(context){
    const req = context.request;
    const searchQuery = req.body;
    ExecuteRequest(searchQuery.query, 1).then((searchResults) => {
        console.log(searchResults);
        return Response.json(searchResults)
    });
}