import React, { useState } from 'react';
import axios from 'axios';
import CheckoutItem from './components/CheckoutItem';

import './App.css';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS;

const App = () => {
    const [itemId, setItemId] = useState('');
    const [itemDetails, setItemDetails] = useState(null);
    const [salePrice, setSalePrice] = useState('');
    const [saleSource, setSaleSource] = useState('Storefront');
    const [customSaleSource, setCustomSaleSource] = useState('');
    const [message, setMessage] = useState('');

    const fetchItemDetails = async (id) => {
        try {
            const response = await axios.get(`http://${server_address}/items/${id.replace('ITM-', '')}`);
            setItemDetails(response.data);
        } catch (error) {
            setMessage('Error: ' + error.response.data.message);
            setItemDetails(null);
        }
    };

    const handleSalePriceChange = (e) => {
        setSalePrice(e.target.value);
    };

    const handleSaleSourceChange = (e) => {
        setSaleSource(e.target.value);
        if (e.target.value !== 'Other') {
            setCustomSaleSource('');
        }
    };

    const handleCustomSaleSourceChange = (e) => {
        setCustomSaleSource(e.target.value);
    };

    const handleUpdate = async () => {
        if (itemDetails.quantity < 1) {
            alert("This item may have already been sold.");
            return;
        }

        const finalSaleSource = saleSource === 'Other' ? customSaleSource : saleSource;

        try {
            await axios.post(`http://${server_address}/sales`, {
                item_id: parseInt(itemId.replace('ITM-', '')),
                sale_price: parseFloat(salePrice),
                sale_date: new Date().toISOString().slice(0, 10),
                sale_source: finalSaleSource
            });

            await axios.put(`http://${server_address}/items/${itemId.replace('ITM-', '')}`, {
                ...itemDetails,
                quantity: itemDetails.quantity - 1
            });

            setMessage('Sale recorded and item quantity updated.');
            fetchItemDetails(itemId.replace('ITM-', '')); // Refresh item details
        } catch (error) {
            setMessage('Error: ' + error.response.data.message);
        }
    };

    return (
        <div className="app-container">
            <h1>Sold</h1>
            <div className="input-container">
                <input
                    type="text"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="ITM-[id]"
                    onBlur={() => fetchItemDetails(itemId)}
                />
            </div>
            <div className="checkout-container">
                {itemDetails && (
                    <CheckoutItem
                        item={itemDetails}
                        salePrice={salePrice}
                        handleSalePriceChange={handleSalePriceChange}
                        handleUpdate={handleUpdate}
                    />
                )}
            </div>
            <div className="sale-info-container">
                <p>Sale Location: </p>
                <select value={saleSource} onChange={handleSaleSourceChange}>
                    <option value="Storefront">Storefront</option>
                    <option value="eBay">eBay</option>
                    <option value="Other">Other</option>
                </select>
                {saleSource === 'Other' && (
                    <input
                        type="text"
                        value={customSaleSource}
                        onChange={handleCustomSaleSourceChange}
                        placeholder="Enter Sale Source"
                    />
                )}
                <button onClick={handleUpdate}>Sell</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
};


export default App;
