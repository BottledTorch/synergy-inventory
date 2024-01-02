import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './VendorSelector.css'; // Import the CSS file
const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS;

const VendorSelector = ({ vendor, onVendorChange }) => {
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const blurTimeoutRef = useRef(null);

    useEffect(() => {
        if (vendor) {
            axios.get(`http://${server_address}/vendors`)
                .then(response => {
                    const filteredSuggestions = response.data.filter(v => 
                        v.name.toLowerCase().startsWith(vendor.toLowerCase()));
                    setSuggestions(filteredSuggestions);
                })
                .catch(error => console.error('Error fetching vendors:', error));
        } else {
            setSuggestions([]);
        }
    }, [vendor]);

    const handleSuggestionClick = (suggestion) => {
        onVendorChange(suggestion.name);
        setShowSuggestions(false); // Hide suggestions after selection
        if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current); // Clear the timeout if a suggestion is clicked
        }
    };

    const handleBlur = () => {
        blurTimeoutRef.current = setTimeout(() => {
            setShowSuggestions(false);
        }, 100);
    };

    return (
        <div className="vendorSelector">
            <label htmlFor="vendor-name">Vendor Name:</label>
            <input
                type="text"
                id="vendor-name"
                value={vendor}
                onChange={e => { onVendorChange(e.target.value); setShowSuggestions(true); }}
                placeholder="Enter Vendor Name"
                onBlur={handleBlur}
                onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
                <div className="suggestionsContainer">
                    {suggestions.map((suggestion, index) => (
                        <div 
                            key={index} 
                            className="suggestion"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion.name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default VendorSelector;
