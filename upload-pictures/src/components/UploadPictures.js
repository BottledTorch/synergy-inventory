import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import imageCompression from 'browser-image-compression';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS || '10.1.0.16:3000';

const UploadPictures = () => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadedImageUrls, setUploadedImageUrls] = useState([]);
    const [message, setMessage] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const { itemId } = useParams(); // Get the item ID from the URL

    useEffect(() => {
        if (itemId) {
            axios.get(`http://${server_address}/items/${itemId}`)
                .then(response => {
                    setSelectedItem(response.data);
                })
                .catch(error => {
                    setMessage("Error fetching item: " + error.message);
                });
        }
    }, [itemId]);

    const compressAndConvertImage = async (file, index, totalFiles) => {
        const options = {
            maxSizeMB: 0.2, // Max file size (200KB)
            maxWidthOrHeight: 1920, // Max width or height
            useWebWorker: true,
            fileType: 'image/jpeg', // Convert to JPEG
        };
        try {
            const compressedFile = await imageCompression(file, options);
            const compressionProgress = Math.round(((index + 1) / totalFiles) * 50); // 50% of progress is for compression
            setUploadProgress(compressionProgress);
            return compressedFile;
        } catch (error) {
            console.error("Error compressing image:", error);
            throw error;
        }
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
            setUploadProgress(0);

            const compressedFiles = await Promise.all(
                selectedFiles.map((file, index) => compressAndConvertImage(file, index, selectedFiles.length))
            );

            const imageIds = await Promise.all(compressedFiles.map((file, index) => {
                return axios.post(`http://${server_address}/images`, {
                    item_id: selectedItem.id,
                    image_url: '',
                    image_description: `Image uploaded for item ${selectedItem.id}`
                }).then(response => response.data.image_id);
            }));

            const urlResponse = await axios.get(`http://${server_address}/generate-presigned-urls`, {
                params: {
                    imageIds: imageIds,
                    itemId: selectedItem.id
                }
            });
            const { presignedUrls, accessUrls } = urlResponse.data;

            await Promise.all(compressedFiles.map((file, index) => {
                return axios.put(presignedUrls[index], file, {
                    headers: {
                        'Content-Type': 'image/jpeg'
                    },
                    onUploadProgress: (progressEvent) => {
                        const uploadProgress = Math.round((progressEvent.loaded * 50 / progressEvent.total) + 50); // 50% to 100% of progress is for upload
                        setUploadProgress(uploadProgress);
                    }
                });
            }));

            await Promise.all(accessUrls.map((url, index) => {
                return axios.put(`http://${server_address}/images/${imageIds[index]}`, {
                    image_url: url
                });
            }));

            setUploadedImageUrls(accessUrls);
            setMessage("Images uploaded and items created successfully.");
            alert(`Successfully uploaded ${compressedFiles.length} images.`);
            setSelectedFiles([]);
        } catch (error) {
            setMessage("Error uploading images and creating items: " + error.message);
            alert("Error uploading images: " + error.message);
        }
    };

    return (
        <div>
            {selectedItem && <div>
                <progress value={uploadProgress} max="100"></progress>
                <h3>Selected Item: {selectedItem.name}</h3>
                <input type="file" multiple accept="image/*" onChange={handleFileChange} />
                <button onClick={handleUpload}>Upload Images</button>
            </div>}
            {message && <p>{message}</p>}
        </div>
    );
};

export default UploadPictures;
