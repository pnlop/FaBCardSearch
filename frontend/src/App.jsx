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
  LoadingOverlay,
  SegmentedControl,
  Text,
  Title
} from "@mantine/core";
import { useDisclosure, useHeadroom, useWindowScroll } from "@mantine/hooks";
import { IconArrowLeft } from "@tabler/icons-react";
import { useState } from "react";
import ListingTableView from "./ListingTableView";
import SearchBar from "./SearchBar";
import URLInput from "./URLInput";
import Footer from "./Footer";

function App() {
  const [cards, setCards] = useState([]);
  const [pageview, setPageview] = useState(false);
  const [listingsData, setListings] = useState([]);
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [errorURL, setErrorURL] = useState("");
  const [value, setValue] = useState("fab");
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure(false);
  const pinned = useHeadroom({fixedAt:"0"});
  const footerpinned = useHeadroom({fixedAt:"0%"})
  const [scroll, scrollTo] = useWindowScroll();

  const LSSImageURL =
    "https://d2h5owxb2ypf43.cloudfront.net/cards/";
  const webpURLSuffix = ".webp";
  const backendURL = "https://fabcardshark.com/api";


  const setTCG = (value) => {
    setCards([]);
    setValue(value);
  }

  const handleImageClick = async (cardData, storeUrls, tcg, tcgAbbr) => {
    if (cardData.length === 0 || storeUrls.length === 0) {
      setErrorURL("Please enter at least one URL to search");
      return;
    }
    try {
      setErrorURL("");
      const listingRequest = { storeUrls: cardData, cardData: storeUrls, tcg: tcg, tcgAbbr: tcgAbbr };
      setScraping(true);
      scrollTo({y: 0});
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
          setPageview(1);
          console.log("Listing Data: " + data);
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
    if (value === "fab") {
      await searchFaB(query);
    } else {
      await searchMTG(query);
    }
  };

  const searchFaB = async (query) => {
    try {
      setLoading(true);
      scrollTo({y: 0});
      const queryPayload = { query: query };
      const queryJSON = JSON.stringify(queryPayload);
      fetch(backendURL + "/searchCard", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
	          'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'POST',
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

  const searchMTG = async (query) => {
    try {
      setLoading(true);
      scrollTo({y: 0});
      const queryPayload = { query: query };
      const queryJSON = JSON.stringify(queryPayload);
      fetch(backendURL + "/searchCardMTG", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
	          'Access-Control-Allow-Origin':'*',
            'Access-Control-Allow-Methods':'POST',
        },
        body: queryJSON,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Success:", data);
          data.searchResults = data.data;
          setCards(data);
          console.log(data.searchResults);
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
      header={{ height: 200, offset:false, collapsed:!pinned}}
      padding="md"
      withBorder={false}
      layout="alt"
      aside={{
        width: 300,
        justify: "center",
        align: "center",
        breakpoint: "lg",
        collapsed: { desktop: !mobileOpened, mobile: !mobileOpened },
      }}
      footer={{
        collapsed: false, offset: true, height: 65
      }}
    >
      <div className="App">
      <AppShell.Aside px={25} style={{backgroundColor:"whitesmoke", border:"solid 0.065rem lightgray"}}>
          <Burger
            onClick={toggleMobile}
            pb={50}
            pt={20}
          ></Burger>
          <Box align="center" pt={15}>
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
        <AppShell.Header>
          <ActionIcon
            variant="subtle"
            size="xl"
            display={listingsData.length === 0 ? "none" : "block"}
            onClick={() => setPageview(!pageview)}
          >
            <IconArrowLeft stroke={2.5} />
          </ActionIcon>
          <Burger
            onClick={toggleMobile}
            pt={15}
            display={mobileOpened ? "none" : "block"}
            style={{ position: "absolute", right: 15 }}
          ></Burger>
          <Center overflow="hidden">
            <Image fit="contain"
                  radius={"md"}
                  h={150}
                  src={ "/favicon.svg" }/>
            <Title order={1}>Card Shark</Title>
          </Center>
        </AppShell.Header>
        
        <AppShell.Main>
          <Container size="lg" pt={200}>
            {!pageview && (
              <Flex gap={"sm"} justify="center" overflow="hidden" p={25}>
                <Flex align={"center"} direction="column" w="100%">
                  <Center pb={40}>
                    <SegmentedControl value={value} onChange={setTCG} color="blue" data={[{label: 'FaB', value: "fab"}, {label: 'MTG', value: "mtg"}]} />
                    <SearchBar onSearch={handleSearch} loading={loading} />
                  </Center>
                  {errorURL && <Text size="lg" c="red">{errorURL}</Text>}
                  <Grid className="search-results">
                  <LoadingOverlay visible={loading}  zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ color: 'pink', type: 'bars' }}/>
                  <LoadingOverlay visible={scraping} zIndex={1000} overlayProps={{ radius: 'sm', blur: 2 }} loaderProps={{ color: 'pink', type: 'bars' }}/>
                    {cards.searchResults?.map((card) => (
                      <Grid.Col className="card-info" span={"content"} p={25}>
                        <Card
                          onClick={() => handleImageClick(urls, card, value === "fab" ? "flesh and blood" : "magic: the gathering", value)}
                          style={{ cursor: "pointer" }}
                          p={25}
                        >
                          <Card.Section>
                            <Image
                              fit="contain"
                              key={card.name}
                              radius={"md"}
                              h={250}
                              src={ value === "fab" ?
                                LSSImageURL + card.defaultImage + webpURLSuffix : card.image_uris ? card.image_uris.normal : "https://placehold.co/175x250?text=No+Image"
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
                {listingsData.listings.map((listing) => (
                  <ListingTableView listings={listing} />
                ))}
              </div>
            )}
          </Container>
        </AppShell.Main>
        <AppShell.Footer>
          <Footer/>
        </AppShell.Footer>
      </div>
    </AppShell>
  );
}

export default App;
