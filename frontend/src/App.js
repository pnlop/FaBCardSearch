import './App.css';
import {useState} from "react";
import {SearchCard, SearchResults} from "@flesh-and-blood/search";
import SearchBar from "./SearchBar";
import URLInput from "./URLInput";
import ListingTableView from './ListingTableView';

function App() {
    const [cards: SearchResults, setCards] = useState([]);
    const [pageview, setPageview] = useState(0);
    const [listingsData, setListings] = useState([]);
    const [url, setUrl] = useState('');
    const [urls, setUrls] = useState([]);
    const [error, setError] = useState('');
    const LSSImageURL = "https://d2wlb52bya4y8z.cloudfront.net/media/cards/small/";
    const webpURLSuffix = ".webp";
    const backendURL = "http://localhost:5000";
    const handleImageClick = async (cardData: SearchCard, storeUrls: string[]) => {
        try {
            const listingRequest = {storeUrls: cardData, cardData: storeUrls};
            fetch(backendURL + '/searchListings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify(listingRequest),
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    // Update the state with the new data if needed
                    // setImages(updatedImages);
                    setPageview(1)
                    setListings(data)
                })

        } catch (error) {
            console.error('Error:', error);
        }
    };
    const handleSearch = async (query: string) => {
        try {
            const queryPayload = {query: query};
            const queryJSON = JSON.stringify(queryPayload);
            fetch(backendURL+'/searchCard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: queryJSON,
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Success:', data);
                    setCards(data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });


        } catch (error) {
            console.error('Error:', error);
        }
    };

    const addUrl = (newUrl) => {
        setUrls([...urls, newUrl]);
        setError('');
    };

    return (
        <div className="App">
            {pageview === 0 && (<div className="search-view">
                <div className="store-adder">
                    <h2>Enter Store URL</h2>
                <URLInput url={url}
                          urls={urls}
                          setUrls={setUrls}
                          setUrl={setUrl}
                          addUrl={addUrl}
                          error={error}
                          setError={setError}/>
                </div>
                <div className="header">
                <div className="search-bar">
                    <h1 className="title">Card Shark</h1>
                    <SearchBar onSearch={handleSearch}/>
                </div>
                </div>
                <div className="search-results">
                    {cards.searchResults?.map((card) => (
                        <div className="card-info">
                            <img
                                key={card.cardIdentifier}
                                src={LSSImageURL+card.defaultImage+webpURLSuffix}
                                alt={card.name + "(" + card.cardIdentifier + ")"}
                                className="clickable-image"
                                onClick={() => handleImageClick(urls, card)}
                            />
                            <h3>{card.name}</h3>
                        </div>
                    ))}
                </div>
            </div>)}

            {pageview === 1 && (<div className="listing-view">
                <button onClick={() => setPageview(0)}>Back</button>
                <ListingTableView listings={listingsData}/>
            </div>)}
        </div>
    );
}

export default App;
