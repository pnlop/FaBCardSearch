// src/URLInput.js
import {
  Anchor,
  Box,
  Button,
  CloseButton,
  TextInput,
  Title,
} from "@mantine/core";

function normalizeUrl(urlString) {
  // If the URL starts with 'http://' or 'https://', it's already normalized
  if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
    if (urlString.endsWith('/')) {
      return urlString;
    } else {
      return urlString + '/';
    }
  }

  // If the URL starts with 'www.', prepend 'https://'
  if (urlString.startsWith('www.')) {
      return 'https://' + urlString + '/';
  }

  // Otherwise, treat it as a domain without protocol and prepend 'https://'
  if (urlString.includes('.')) {
    return 'https://' + urlString + '/';
  }

  return urlString;
}

// Helper function to validate URLs
const isValidURL = (string) => {
  try {
    new URL(normalizeUrl(string));
    return true;
  } catch (e) {
    return false;
  }
};

const URLInput = ({ url, urls, setUrls, setUrl, addUrl, error, setError }) => {
  const handleChange = (e) => {
    setUrl(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isValidURL(url)) {
      addUrl(normalizeUrl(url));
      setUrl("");
    } else {
      setError("Please enter a valid URL.");
    }
  };

  const removeItem = (index) => {
    setUrl("");
    setUrls(urls.filter((_, i) => i !== index));
  };

  return (
    <Box
      align="center"
      maw={{
        xs: 500,
        sm: 500,
        md: 500,
        lg: 500,
        xl: 300,
      }}
      w="100%"
      right={{ xl: 25 }}
    >
      <Title order={2}>Enter Store URL</Title>
      <form onSubmit={handleSubmit}>
        <TextInput
          type="text"
          value={url}
          onChange={handleChange}
          placeholder="Enter a URL"
          p={5}
        />
        <Button type="submit">Add URL</Button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Box
        p={10}
        mah={400}
        style={{ overflowY: "scroll", overflowX: "hidden" }}
      >
        {urls.map((url, index) => (
          <Box align="left">
            <CloseButton
              className="remove"
              p={5}
              onClick={() => removeItem(index)}
            ></CloseButton>
            <Anchor href={url} target="_blank" rel="noopener noreferrer">
              {url}
            </Anchor>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default URLInput;
