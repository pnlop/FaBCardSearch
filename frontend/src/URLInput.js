// src/URLInput.js
import './URLInput.css';

// Helper function to validate URLs
const isValidURL = (string) => {
    try {
        new URL(string);
        return true;
    } catch (e) {
        return false;
    }
};

const URLInput = ({ url, urls, setUrls, setUrl, addUrl, error, setError}) => {
    const handleChange = (e) => {
        setUrl(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isValidURL(url)) {
            addUrl(url);
            setUrl('');
        } else {
            setError('Please enter a valid URL.');
        }
    };

    const removeItem = (index) => {
        setUrl('');
        setUrls(urls.filter((_, i) => i !== index));
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={url}
                    onChange={handleChange}
                    placeholder="Enter a URL"
                />
                <button type="submit">Add URL</button>
            </form>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {urls.map((url, index) => (
                    <li key={index}><button className="remove" onClick={() => removeItem(index)}>remove</button><a href={url} target="_blank" rel="noopener noreferrer">{url}</a></li>
                ))}
            </ul>
        </div>
    );
};

export default URLInput;
