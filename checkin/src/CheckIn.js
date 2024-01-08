import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PurchaseOrderInput from './components/PurchaseOrderInput';
import ItemList from './components/ItemList';
import AddButton from './components/AddButton';
import handlePrintBarcode from './components/HandleBarcode';

import './CheckIn.css';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS;

const CheckIn = () => {
    const [items, setItems] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [selectedItemIds, setSelectedItemIds] = useState([]);
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
            axios.get(`http://${server_address}/purchase_orders/${selectedPO}/items`)
                .then(response => {
                    setItems(response.data);
                })
                .catch(error => {
                    console.error("Error fetching items for selected PO:", selectedPO);
                });
        }
    }, [selectedPO]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (selectedPO) {
                axios.get(`http://${server_address}/purchase_orders/${selectedPO}/items`)
                    .then(response => {
                        setItems(response.data);
                    })
                    .catch(error => {
                        console.error("Error fetching items for selected PO:", selectedPO);
                    });
            }
        }, 2000);

        return () => clearInterval(intervalId);
    }, [selectedPO]);

    const handleItemSelectionChange = (itemId, isSelected) => {
        setSelectedItemIds(prevSelectedItemIds => {
            if (isSelected) {
                return [...prevSelectedItemIds, itemId];
            } else {
                return prevSelectedItemIds.filter(id => id !== itemId);
            }
        });
    };

    // Function to combine selected items
    const combineItems = async () => {
        if (selectedItemIds.length < 2) {
            alert("Please select at least two items to combine.");
            return;
        }
    
        try {
            const combinedItem = {
                description: '',
                quantity: 0,
                purchase_price: 0,
                progress: 'received',
                purchase_order_id: selectedPO,
                // ... other necessary fields ...
            };
    
            for (const itemId of selectedItemIds) {
                const response = await axios.get(`http://${server_address}/items/${itemId}`);
                const item = response.data;
                combinedItem.name = item.name;
                combinedItem.description += `${item.name}, `;
                combinedItem.quantity += item.quantity || 1;
                combinedItem.purchase_price += item.purchase_price || 0;
            }
    
            combinedItem.name = 'Lot ' + combinedItem.name;
    
            const response = await axios.post(`http://${server_address}/items`, combinedItem);
            const newCombinedItemId = response.data.itemId;
    
            // Delete combined items
            for (const itemId of selectedItemIds) {
                await axios.delete(`http://${server_address}/items/${itemId}`);
            }
    
            // Update UI
            setItems(prevItems => [
                ...prevItems.filter(item => !selectedItemIds.includes(item.id)),
                {
                    id: newCombinedItemId,
                    ...combinedItem
                }
            ]);
    
            // Reset selected items
            setSelectedItemIds([]);
    
        } catch (error) {
            console.error('Error combining items:', error);
        }
    };
    
    const handleItemChange = (itemId, attribute, newValue) => {
        setItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, [attribute]: newValue } : item
            )
        );

        const updatedItem = items.find(item => item.id === itemId);
        if (updatedItem) {
            const url = `http://${server_address}/items/${itemId}`;
            axios.put(url, { ...updatedItem, [attribute]: newValue })
                .then(response => {
                    console.log("Item updated:", response.data);
                })
                .catch(error => {
                    console.error("Error updating item:", error);
                });
        }
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

    const handleAdd = async () => {
        const itemPayload = {
            name: '',
            description: '',
            progress: 'received',
            purchase_order_id: selectedPO,
            observed_condition: '',
            isLot: false,
            quantity: 1,
        };

        try {
            const response = await axios.post(`http://${server_address}/items`, itemPayload);
            const newItemID = response.data.itemId;

            setItems(prevItems => [
                ...prevItems,
                {
                    id: newItemID,
                    ...itemPayload
                }
            ]);
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    return (
        <div>
            <PurchaseOrderInput 
                poInput={poInput}
                setPoInput={setPoInput}
                poRecommendations={poRecommendations}
                setSelectedPO={setSelectedPO}
            />
            {selectedPO && items.length > 0 && (
                <ItemList 
                    items={items} 
                    selectedItemIds={selectedItemIds}
                    handleItemSelectionChange={handleItemSelectionChange}
                    handlePrintBarcode={handlePrintBarcode}
                    handleItemChange={handleItemChange}
                    handleDelete={handleDelete}
                />
            )}
            <button onClick={combineItems} disabled={selectedItemIds.length < 2}>
                Combine Selected Items
            </button>
            <AddButton handleAdd={handleAdd} />
        </div>
    );
};

export default CheckIn;
