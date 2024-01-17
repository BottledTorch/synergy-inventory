import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS || '10.1.0.16:3000';

const UploadPictures = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]); // New state to store uploaded image URLs
    const [message, setMessage] = useState('');
    const { itemId } = useParams(); // Get the item ID from the URL

    useEffect(() => {
        if (itemId) {
            // Fetch item details and set as selected item
            axios.get(`http://${server_address}/items/${itemId}`)
                .then(response => {
                    setSelectedItem(response.data);
                })
                .catch(error => {
                    setMessage("Error fetching item: " + error.message);
                });
        }
    }, [itemId]);

    const handleFileChange = (event) => {
        setSelectedFiles(Array.from(event.target.files));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0 || !selectedItem) {
            setMessage("Select an item and files to upload.");
            return;
        }
        try {
            const response = await axios.get(`http://${server_address}/generate-presigned-urls`, {
                params: {
                    itemID: selectedItem.id,
                    fileCount: selectedFiles.length
                }
            });

            const { presignedUrls, accessUrls } = response.data;

            console.log(response)

            await Promise.all(selectedFiles.map((file, index) => {
                return axios.put(presignedUrls[index], file, {
                    headers: {
                        'Content-Type': file.type
                    }
                });
            }));

            setUploadedImageUrls(accessUrls); // Update state with access URLs
            setMessage("Images uploaded successfully.");
        } catch (error) {
            setMessage("Error uploading images: " + error.message);
        }

    };

    return (
        <div>
            {/* Display the selected item and upload UI */}
            {selectedItem && <div>
                <h3>Selected Item: {selectedItem.name}</h3>
                <input type="file" multiple onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload Images</button>
                {/* Display uploaded image URLs */}
                {uploadedImageUrls.map((url, index) => (
                    <div key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer">Image {index + 1}: {url}</a>
                    </div>
                ))}
            </div>}
    
            {message && <p>{message}</p>}
        </div>
    );
};

export default UploadPictures;
