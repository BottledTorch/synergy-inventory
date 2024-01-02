import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PurchaseOrderInput from './components/PurchaseOrderInput';
import ItemList from './components/ItemList';
import AddButton from './components/AddButton';
import SaveButton from './components/SaveButton';
import handlePrintBarcode from './components/HandleBarcode';

import './CheckIn.css';

// const server_address = "localhost:3000";
const server_address = process.env.EXPRESS_SERVER_ADDRESS;


const CheckIn = () => {
    const [items, setItems] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const blurTimeoutRef = useRef(null);
    const [selectedPO, setSelectedPO] = useState(null);
    const [poInput, setPoInput] = useState('');
    const [poRecommendations, setPoRecommendations] = useState([]);

    useEffect(() => {
        axios.get(`http://${server_address}/purchase_orders`)
            .then(response => {
                setPurchaseOrders(response.data);
                setPoRecommendations(response.data);
            })
            .catch(error => {
                console.error("Error fetching purchase orders:", error);
            });
    }, []);

    useEffect(() => {
        if (selectedPO) {
            setItems([]);
            axios.get(`http://${server_address}/purchase_orders/${selectedPO}/items`)
                .then(response => {
                    setItems(response.data);
                })
                .catch(error => {
                    console.info("Error fetching items for selected PO:", selectedPO);
                });
        }
    }, [selectedPO]);

    useEffect(() => {
        if (poInput) {
            const filteredPOs = purchaseOrders.filter(po => 
                po.id.toString().includes(poInput)
            );
            setPoRecommendations(filteredPOs);
        } else {
            setPoRecommendations(purchaseOrders);
        }
    }, [poInput, purchaseOrders]);

    const handleItemChange = (itemId, attribute, newValue) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, [attribute]: newValue } : item
            )
        );
    };

    const handleDelete = (itemId) => {
        if (window.confirm("Are you sure you want to delete this item?")) {
            axios.delete(`http://${server_address}/items/${itemId}`)
                .then(response => {
                    console.log(response.data.message);
                    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
                })
                .catch(error => {
                    console.error("Error deleting item:", error);
                });
        }
    };

    const handleSave = () => {
        items.forEach(item => {
            // Determine if the item is new or existing
            const method = item.id > 0 ? 'put' : 'post';
            const url = item.id > 0 ? `http://${server_address}/items/${item.id}` : `http://${server_address}/items`;

            axios[method](url, item)
                .then(response => {
                    console.log(response.data.message);
                    if (method === 'post') {
                        // Update the ID of the newly added item in the local state
                        setItems(prevItems => 
                            prevItems.map(prevItem => 
                                prevItem.id === item.id ? { ...prevItem, id: response.data.id } : prevItem
                            )
                        );
                    }
                })
                .catch(error => {
                    console.error("Error processing item:", error);
                });
        });
    };
    

    const handleAdd = async () => {
        let newItem = null;
        const itemPayload = {
            name: '',
            description: '',
            progress: 'received',
            purchase_order_id: selectedPO, // Set the PO ID for the new item
            observed_condition: '',
            // ... additional fields ...
        };
    
        try {
            const response = await axios.post(`http://${server_address}/items`, itemPayload);
            const newItemID = response.data.itemId;
    
            // Update the items state only after receiving the response
            setItems(prevItems => [
                ...prevItems,
                {
                    id: newItemID, 
                    name: '',
                    description: '',
                    purchase_price: '',
                    progress: 'received',
                    purchase_order_id: selectedPO, // Set the PO ID for the new item
                    observed_condition: '',
                    // ... other attributes with default values
                }
            ]);
        } catch (error) {
            console.error('Error adding item:', error);
            // Optionally handle the error, e.g., display a message to the user
        }
    };

    return (
        <div>
            <PurchaseOrderInput 
                poInput={poInput}
                setPoInput={setPoInput}
                poRecommendations={poRecommendations}
                setSelectedPO={setSelectedPO}
                isFocused={isFocused}
                setIsFocused={setIsFocused}
                blurTimeoutRef={blurTimeoutRef}
            />
            {selectedPO && items.length > 0 && (
                <ItemList 
                    items={items} 
                    handlePrintBarcode={handlePrintBarcode}
                    handleItemChange={handleItemChange}
                    handleDelete={handleDelete}
                />
            )}
            <SaveButton handleSave={handleSave} />
            <AddButton handleAdd={handleAdd} />
        </div>
    );
};

export default CheckIn;
