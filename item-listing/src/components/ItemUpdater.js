import React, { useState, useEffect } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import { saveAs } from 'file-saver';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import './ItemUpdater.css';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS || '10.1.0.16:3000'; // Replace with your actual server address
const image_app_address = process.env.REACT_APP_UPLOAD_PICTURES_SERVER_ADDRESS || '10.1.0.16:3005'; // Replace with your actual server address

const ItemListingHelper = () => {
    const [searchId, setSearchId] = useState('');
    const [item, setItem] = useState(null);
    const [images, setImages] = useState([]);
    const [message, setMessage] = useState('');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);


    const handleSearch = () => {
        if (!searchId.trim()) {
            setMessage("Please enter a search ID.");
            return;
        }

        axios.get(`http://${server_address}/items/${searchId}`)
            .then(response => {
                setItem(response.data);
                fetchImages(response.data.id);
            })
            .catch(error => {
                setMessage("Error fetching item: " + error.message);
            });
    };

    const handleDeleteImage = async (imageId) => {
        try {
            await axios.delete(`http://${server_address}/images/${imageId}`);
            fetchImages(item.id); // Refetch images to update the list
            setMessage("Image deleted successfully.");
        } catch (error) {
            setMessage("Error deleting image: " + error.message);
        }
    };

    const handleDownloadCurrentImage = () => {
        if (images.length > 0 && currentImageIndex < images.length) {
            const currentImageUrl = images[currentImageIndex].image_url;
            saveAs(currentImageUrl, `image-${images[currentImageIndex].image_id}.jpg`);
        }
    };    
    
    const handleDownloadAllImages = async () => {
        try {
            const response = await axios.get(`http://${server_address}/images/download/${item.id}`, {
                responseType: 'blob', // Important to handle binary data
            });
            saveAs(response.data, `images-${item.id}.zip`);
        } catch (error) {
            console.error("Error downloading images: " + error.message);
        }
    };

    const fetchImages = (itemId) => {
        axios.get(`http://${server_address}/images/byItem/${itemId}`)
            .then(response => {
                setImages(response.data);
            })
            .catch(error => {
                console.log("Error fetching images: " + error.message);
            });
    };    

    useEffect(() => {
        const interval = setInterval(() => {
            if (item) {
                fetchImages(item.id);
            }
        }, 5000); // Polling every 5 seconds

        return () => clearInterval(interval);
    }, [item]);

    const updateListing = () => {
        axios.put(`http://${server_address}/items/${item.id}`, item)
            .then(response => {
                setMessage("Item listing updated successfully.");
            })
            .catch(error => {
                setMessage("Error updating item listing: " + error.message);
            });
    };

    const updateField = (field, value) => {
        setItem({ ...item, [field]: value });
    };

    const textAreaFields = ['description', 'notes'];
    const excludedFields = ['vendor_inventory_label', 'vendor_id', 'purchase_order_id'];

    return (
        <div className="item-updater-container">
            <div>
                <input
                    className="item-updater-input"
                    type="text"
                    placeholder="Enter Item ID"
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                />
                <button 
                    className="item-updater-button"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>

            {item && (
                <>
                    <h2 className="item-updater-header">Item Details</h2>
                    {images.length > 0 && (
                        <>
                            <Carousel selectedItem={currentImageIndex} onChange={(index) => setCurrentImageIndex(index)}>
                                {images.map((image, index) => (
                                    <div key={index}>
                                        <button onClick={() => handleDeleteImage(image.image_id)}>Delete Image</button>
                                        <button onClick={handleDownloadCurrentImage}>Download Current Image</button>

                                        <img src={image.image_url} alt={`Image ${index}`} />
                                    </div>
                                ))}
                            </Carousel>
                            <button className="item-updater-button" onClick={handleDownloadAllImages}>
                                Download All Images
                            </button>
                        </>
                    )}
                    <table className="item-updater-table">
                        <tbody>
                            {Object.keys(item).map(key => (
                                excludedFields.includes(key) ? null : (
                                    <tr key={key}>
                                        <th>{key}</th>
                                        <td>
                                            {textAreaFields.includes(key) ? (
                                                <textarea
                                                    className="item-updater-textarea"
                                                    value={item[key]}
                                                    onChange={e => updateField(key, e.target.value)}
                                                />
                                            ) : (
                                                <input
                                                    className="item-updater-input"
                                                    type="text"
                                                    value={item[key]}
                                                    onChange={e => updateField(key, e.target.value)}
                                                />
                                            )}
                                        </td>
                                    </tr>
                                )
                            ))}
                        </tbody>
                    </table>
                    
                    <button 
                        className="item-updater-button"
                        onClick={updateListing}
                    >
                        Update Listing
                    </button>
                    <h3>Add Photos</h3>
                    <a 
                        href={`http://${image_app_address}/item-id/${item.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        Upload
                    </a>

                    <div>
                        <QRCode value={`http://${image_app_address}/item-id/${item.id}`} />
                    </div>
                    
                </>
            )}

            {message && <p className="item-updater-message">{message}</p>}
        </div>
    );
};

export default ItemListingHelper;
