import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Card,
  Center,
  Container,
  Flex,
  Grid,
  Image,
  Text,
  Title,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import ListingTableView from "./ListingTableView";
import SearchBar from "./SearchBar";
import URLInput from "./URLInput";

function App() {
  const [cards, setCards] = useState([]);
  const [pageview, setPageview] = useState(false);
  const [listingsData, setListings] = useState([]);
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const LSSImageURL =
    "https://d2wlb52bya4y8z.cloudfront.net/media/cards/small/";
  const webpURLSuffix = ".webp";
  const backendURL = "http://localhost:5000";
  const handleImageClick = async (cardData, storeUrls) => {
    try {
      const listingRequest = { storeUrls: cardData, cardData: storeUrls };
      setScraping(true);
      fetch(backendURL + "/searchListings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify(listingRequest),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          // Update the state with the new data if needed
          // setImages(updatedImages);
          setPageview(1);
          setListings(data);
        })
        .finally(() => {
          setScraping(false);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };
  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const queryPayload = { query: query };
      const queryJSON = JSON.stringify(queryPayload);
      fetch(backendURL + "/searchCard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: queryJSON,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          setCards(data);
        })
        .catch((error) => {
          console.error("Error:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const addUrl = (newUrl) => {
    setUrls([...urls, newUrl]);
    setError("");
  };

  return (
    <AppShell
      header={{ height: 100 }}
      padding="md"
      aside={{
        width: 300,
        justify: "center",
        align: "center",
        breakpoint: "lg",
        collapsed: { desktop: !mobileOpened, mobile: !mobileOpened },
      }}
    >
      <div className="App">
        <AppShell.Header p={15}>
          <ActionIcon
            variant="subtle"
            size="xl"
            onClick={() => setPageview(!pageview)}
          >
            <IconArrowLeft stroke={2.5} />
          </ActionIcon>
          <Burger
            onClick={toggleMobile}
            pt={15}
            style={{ position: "absolute", right: 15 }}
          ></Burger>
          <Center>
            <Title order={1}>Card Shark</Title>
          </Center>
        </AppShell.Header>
        <AppShell.Aside>
          <Box align="center">
            <URLInput
              url={url}
              urls={urls}
              setUrls={setUrls}
              setUrl={setUrl}
              addUrl={addUrl}
              error={error}
              setError={setError}
            />
          </Box>
        </AppShell.Aside>
        <AppShell.Main>
          <Container size="lg">
            {!pageview && (
              <Flex gap={"sm"} justify="center" overflow="hidden" p={25}>
                <Flex align={"center"} direction="column" w="100%">
                  <Center pb={40}>
                    <SearchBar onSearch={handleSearch} loading={loading} />
                  </Center>
                  <Grid className="search-results">
                    {cards.searchResults?.map((card) => (
                      <Grid.Col className="card-info" span={"content"} p={25}>
                        <Card
                          onClick={() => handleImageClick(urls, card)}
                          style={{ cursor: "pointer" }}
                          p={25}
                        >
                          <Card.Section>
                            <Image
                              fit="contain"
                              key={card.cardIdentifier}
                              radius={"md"}
                              src={
                                LSSImageURL + card.defaultImage + webpURLSuffix
                              }
                              alt={card.name + "(" + card.cardIdentifier + ")"}
                              className="card-image"
                              fallbackSrc="https://placehold.co/175x250?text=No+Image"
                            />
                          </Card.Section>
                          <Card.Section>
                            <Text align="center" size="md" pt={15}>
                              {card.name}
                            </Text>
                          </Card.Section>
                        </Card>
                      </Grid.Col>
                    ))}
                  </Grid>
                </Flex>
              </Flex>
            )}

            {pageview && (
              <div className="listing-view">
                <ListingTableView listings={listingsData} />
              </div>
            )}
          </Container>
        </AppShell.Main>
      </div>
    </AppShell>
  );
}

export default App;
