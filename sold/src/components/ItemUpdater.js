import React, { useState } from 'react';
import axios from 'axios';

const server_address = "localhost:3000"; // Replace with your actual server address

const ItemUpdater = () => {
    const [searchId, setSearchId] = useState('');
    const [item, setItem] = useState(null);
    const [soldPrice, setSoldPrice] = useState('');
    const [message, setMessage] = useState('');

    const handleSearch = () => {
        axios.get(`http://${server_address}/items/${searchId}`)
            .then(response => {
                setItem(response.data);
                setSoldPrice(response.data.purchase_price || ''); // Pre-fill with the current purchase price
            })
            .catch(error => {
                setMessage("Error fetching item: " + error.message);
            });
    };

    const markAsSold = () => {
        axios.put(`http://${server_address}/items/${item.id}`, {
            ...item,
            sale_price: soldPrice,
            progress: 'sold'
        })
        .then(response => {
            setMessage("Item marked as sold successfully.");
        })
        .catch(error => {
            setMessage("Error marking item as sold: " + error.message);
        });
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px'
    };

    const headerCellStyle = {
        padding: '10px',
        border: '1px solid #ddd',
        background: '#f7f7f7',
        fontWeight: 'bold'
    };

    const cellStyle = {
        padding: '10px',
        border: '1px solid #ddd'
    };

    return (
        <div>
            <div>
                <input
                    type="text"
                    placeholder="Enter Item ID"
                    value={searchId}
                    onChange={e => setSearchId(e.target.value)}
                    style={{ padding: '10px', marginRight: '10px' }}
                />
                <button onClick={handleSearch} style={{ padding: '10px 15px' }}>Search</button>
            </div>

            {item && (
                <>
                    <h2>Item Details</h2>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={headerCellStyle}>ID</th>
                                <th style={headerCellStyle}>Name</th>
                                <th style={headerCellStyle}>Description</th>
                                <th style={headerCellStyle}>Purchase Price</th>
                                <th style={headerCellStyle}>Progress</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={cellStyle}>{item.id}</td>
                                <td style={cellStyle}>{item.name}</td>
                                <td style={cellStyle}>{item.description}</td>
                                <td style={cellStyle}>{item.purchase_price}</td>
                                <td style={cellStyle}>{item.progress}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <input
                        type="text"
                        value={soldPrice}
                        onChange={e => setSoldPrice(e.target.value)}
                        placeholder="Enter Sold Price"
                        style={{ padding: '10px', marginRight: '10px' }}
                    />
                    <button onClick={markAsSold} style={{ padding: '10px 15px', marginTop: '10px' }}>Mark as Sold</button>
                </>
            )}

            {message && <p>{message}</p>}
        </div>
    );
};

export default ItemUpdater;
