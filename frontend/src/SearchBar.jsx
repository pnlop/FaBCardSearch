import { Button, Center, TextInput } from "@mantine/core";
import React, { useState } from "react";
const SearchBar = ({ onSearch, loading }) => {
  const [query, setQuery] = useState("");

  const handleInputChange = (event) => {
    setQuery(event.target.value);
  };

  const handleSearch = () => {
    onSearch(query);
  };

  return (
    <Center>
      <TextInput
        type="text"
        value={query}
        w={ {"xs": "280", "sm": "300", "md": "300", "lg": "300", "xl": "300"}}
        onChange={handleInputChange}
        placeholder="Search FaB Card..."
        className="searchTerm"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSearch();
          }
        }}
      />
      <Button
        type="submit"
        className="searchButton"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? "Loading..." : "Search"}
      </Button>
    </Center>
  );
};

export default SearchBar;
