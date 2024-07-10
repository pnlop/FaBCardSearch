import React, {useState} from 'react';
import './SearchBar.css';
const SearchBar = ({onSearch}) => {
    const [query, setQuery] = useState('');

    const handleInputChange = (event) => {
        setQuery(event.target.value);
    };

    const handleSearch = () => {
        onSearch(query);
    };

    return (
        <div className="wrap">
            <div className="search">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder="Search FaB Card..."
                    className="searchTerm"
                />
                <button onClick={handleSearch} className="searchButton">Search</button>
            </div>
        </div>
    );
};

export default SearchBar;