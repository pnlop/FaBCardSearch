import { ActionIcon, Center, TextInput } from "@mantine/core";
import { IconSearch, IconLoader2, IconArrowRight } from "@tabler/icons-react";
import { useState } from "react";
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
      radius="xl"
      size="md"
      onChange={handleInputChange}
      value={query}
      w={ {"xs": "280", "sm": "300", "md": "300", "lg": "300", "xl": "300"}}
      pl={10}
      placeholder="Search FaB Card..."
      rightSectionWidth={42}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      }}
      leftSection={<IconSearch style={{ width: "15rem", height: "15rem" }} stroke={1.5} />}
      rightSection={
        <ActionIcon size={32} radius="xl" color="blue" variant="filled">
          {loading ? 
            <IconLoader2 style={{ width: "18rem", height: "18rem" }} stroke={1.5} /> :
            <IconArrowRight style={{ width: "18rem", height: "18rem" }} stroke={2} onClick={handleSearch}/> } 
        </ActionIcon>
      }
    />
    </Center>
  );
};

export default SearchBar;
