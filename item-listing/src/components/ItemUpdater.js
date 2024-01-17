import React, { useState } from 'react';
import axios from 'axios';
import QRCode from 'qrcode.react';
import './ItemUpdater.css';

const server_address = "10.1.0.16:3000"; // Replace with your actual server address
const minio_address = "10.1.0.16:9000"; // Replace with your MinIO server address

const ItemListingHelper = () => {
    const [searchId, setSearchId] = useState('');
    const [item, setItem] = useState(null);
    const [message, setMessage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    const handleSearch = () => {
        axios.get(`http://${server_address}/items/${searchId}`)
            .then(response => {
                setItem(response.data);
            })
            .catch(error => {
                setMessage("Error fetching item: " + error.message);
            });
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = () => {
        if (!selectedFile) {
            setMessage("No file selected for upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        axios.post(`http://${minio_address}/upload/${item.id}`, formData)
            .then(response => {
                setMessage("Image uploaded successfully. URL: " + response.data.url);
            })
            .catch(error => {
                setMessage("Error uploading image: " + error.message);
            });
    };

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

                    <div>
                        <QRCode value={`http://${server_address}/upload?itemId=${item.id}`} />
                        <input type="file" onChange={handleFileChange} />
                        <button onClick={handleUpload}>Upload Image</button>
                    </div>
                </>
            )}

            {message && <p className="item-updater-message">{message}</p>}
        </div>
    );
};

export default ItemListingHelper;