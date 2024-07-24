import express from "express";
import cors from "cors";
import Search from "@flesh-and-blood/search";
import { DoubleSidedCard } from "@flesh-and-blood/types";
import { cards } from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import { execFile, spawn } from "child_process";
import axios from "axios";
import { Readable } from "node:stream";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

app.post('/api/searchCard', (req, res) => {
    const searchQuery = req.body;
    //from @flesh-and-blood/search search.tests.ts
    const doubleSidedCards: DoubleSidedCard[] = cards.map((card) => {
        if (card.oppositeSideCardIdentifier) {
            const oppositeSideCard = cards.find(
                ({ cardIdentifier }) => cardIdentifier === card.oppositeSideCardIdentifier
            );
            if (oppositeSideCard) {

                (card as DoubleSidedCard).oppositeSideCard = oppositeSideCard;
            }
        }
        return card;
    });

    const search = new Search(doubleSidedCards);
    const searchResults = search.search(searchQuery.query);

    res.contentType('application/json')
    res.send(JSON.stringify(searchResults, function(key, value) {
        if(key == 'oppositeSideCard') { 
          return "Double Sided Card (broken behaviour)";
        } else {
          return value;
        };
      }));

});

async function ExecuteRequest(query, page): Promise<[]> {
    let response = await axios.get('https://api.scryfall.com/cards/search?page='+page+'&q='+query);
    let data = response.data;
    //if (response.data.has_more === true) {
    //    return data.concat(await ExecuteRequest(query, page++));
    //} else {
        return data;
    //}
}

app.post('/api/searchCardMTG', (req, res) => {
    const searchQuery = req.body;
    ExecuteRequest(searchQuery.query, 1).then((searchResults) => {
        console.log(searchResults);
        res.contentType('application/json');
        res.send(searchResults);
    });
});



app.post('/api/searchListings', (req, res) => {
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    const tcg = requestData.tcg;
    const tcgAbbr = requestData.tcgAbbr;
    let splitTitle;
    let color = "";
    if (tcgAbbr === "fab") {
        splitTitle = cardData.cardIdentifier.split('-');
        console.log(splitTitle);
        console.log(splitTitle[splitTitle.length - 1]);
        if (["red", "blue", "yellow"].includes(splitTitle[splitTitle.length - 1])) {
            color = splitTitle[splitTitle.length - 1];
        }
    }
    scrapeSite(storeUrls, cardData.name, tcg, tcgAbbr, color).then((results) => {
        res.contentType('application/json');
        res.send(results);
    });

});

async function scrapeSite(urls, cardIdentifier, tcg, tcgAbbr, color ) {
    // Perform scraping for each URL
    console.log(cardIdentifier + " " + tcg + " " + tcgAbbr + " " + color);
    const results = await Promise.all( urls.map((url) => {
        return executeParser(url, cardIdentifier, tcg, tcgAbbr, color);
    }));
    console.log(results);
    return results;
}

async function executeParser(url, cardIdentifier, tcg, tcgAbbr, color) {
       let proc = execFile("/home/admin/apps/FaBCardSearch/backend/parser/target/release/parser", [url, cardIdentifier, tcg, tcgAbbr, color]);
         let output = "";
            let error = "";
            proc.stdout.on('data', (data) => {
                output += data;
            });
            proc.stderr.on('data', (data) => {
                error += data;
            });
            return new Promise((resolve, reject) => {
                proc.on('exit', (code) => {
                    if (code === 0) {
                        let spaceholder = { listings: output, url: url };
                        resolve(spaceholder);
                    } else {
                        reject(error);
                    }
                });
            });
}

