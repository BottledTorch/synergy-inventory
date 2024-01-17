import React, { useState } from 'react';
import axios from 'axios';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS || '10.1.0.16:3000'


const UploadPictures = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [message, setMessage] = useState('');

    const handleSearch = () => {
        let itemId = searchQuery.replace(/^ITM-/, ''); // Remove "ITM-" prefix if present
        itemId = encodeURIComponent(itemId); // URL-encode the item ID
        console.log(server_address)
        axios.get(`http://${server_address}/items/${itemId}`)
            .then(response => {
                setSelectedItem(response.data);
            })
            .catch(error => {
                setMessage("Error fetching item: " + error.message);
            });
    };

    const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files));
    };
    

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !selectedItem) {
            setMessage("Select an item and files to upload.");
            return;
        }
    
        try {
            // Request pre-signed URLs from the Express server
            const response = await axios.get(`http://${server_address}/generate-presigned-urls`, {
                params: {
                    itemID: selectedItem.id,
                    fileCount: selectedFiles.length
                }
            });
    
            const presignedUrls = response.data;
    
            // Upload files directly to MinIO using the pre-signed URLs
            await Promise.all(selectedFiles.map((file, index) => {
                return axios.put(presignedUrls[index], file, {
                    headers: {
                        'Content-Type': file.type
                    }
                });
            }));
    
            setMessage("Images uploaded successfully.");
        } catch (error) {
            setMessage("Error uploading images: " + error.message);
        }
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Enter Item ID (e.g., ITM-123 or 123)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>

            {selectedItem && <div>
                <h3>Selected Item: {selectedItem.name}</h3>
                <input type="file" multiple onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload Images</button>
            </div>}

            {message && <p>{message}</p>}
        </div>
    );
};

export default UploadPictures;
