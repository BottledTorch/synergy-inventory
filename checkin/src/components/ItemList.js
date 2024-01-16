import React from 'react';

const ItemList = ({ items, handlePrintBarcode, handleItemChange, handleDelete, selectedItemIds, handleItemSelectionChange }) => {
    // Function to determine the background color
    const getBackgroundColor = (progress) => {
        switch (progress) {
            case 'received':
                return 'lightgreen'; // Green for 'Received'
            case 'not received':
                return 'lightcoral'; // Light red for 'Not Received'
            default:
                return 'white'; // Default color for other statuses
        }
    };

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Select</th>
                        <th>Barcode Popup</th>
                        <th>PO Number</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Purchase Price</th>
                        <th>Quantity</th>
                        <th>Is Lot</th>
                        <th>Progress</th>
                        <th>Condition</th>
                        <th>Vendor Label</th> {/* New column for Vendor Label */}
                        <th></th> {/* Column for Delete button */}
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item.id} style={{ backgroundColor: getBackgroundColor(item.progress) }}>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={(e) => handleItemSelectionChange(item.id, e.target.checked)}
                                />
                            </td>
                            <td>
                                <button onClick={() => handlePrintBarcode(item.id)}>Barcode</button>
                                <p>{item.id}</p>
                            </td>
                            <td contentEditable={true} onBlur={(e) => handleItemChange(item.id, 'purchase_order_id', e.currentTarget.textContent)} suppressContentEditableWarning={true}>
                                {item.purchase_order_id}
                            </td>
                            <td contentEditable={true} onBlur={(e) => handleItemChange(item.id, 'name', e.currentTarget.textContent)} suppressContentEditableWarning={true}>
                                {item.name}
                            </td>
                            <td contentEditable={true} onBlur={(e) => handleItemChange(item.id, 'description', e.currentTarget.textContent)} suppressContentEditableWarning={true}>
                                {item.description}
                            </td>
                            <td contentEditable={true} onBlur={(e) => handleItemChange(item.id, 'purchase_price', e.currentTarget.textContent)} suppressContentEditableWarning={true}>
                                {item.purchase_price}
                            </td>
                            <td contentEditable={true} onBlur={(e) => handleItemChange(item.id, 'quantity', e.currentTarget.textContent)} suppressContentEditableWarning={true}>
                                {item.quantity}
                            </td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={item.isLot}
                                    onChange={(e) => handleItemChange(item.id, 'isLot', e.target.checked)}
                                />
                            </td>
                            <td>
                                <select 
                                    value={item.progress} 
                                    onChange={(e) => handleItemChange(item.id, 'progress', e.target.value)}
                                    style={{ backgroundColor: getBackgroundColor(item.progress) }}
                                >
                                    <option value="not received">Not Received</option>
                                    <option value="received">Received</option>
                                    <option value="tested">Tested</option>
                                    <option value="listed">Listed</option>
                                    <option value="sold">Sold</option>
                                    <option value="junk">Junk</option>
                                </select>
                                <button 
                                    onClick={
                                        () => 
                                        {
                                            handleItemChange(item.id, 'progress', 'received')
                                            if (item.quantity === null || item.quantity === '') {
                                                handleItemChange(item.id, 'quantity', 1);
                                            }
                                        }
                                    }
                                    style={{'margin': '5px'}}>
                                        Received
                                </button>
                            </td>
                            <td contentEditable={true} onBlur={(e) => handleItemChange(item.id, 'observed_condition', e.currentTarget.textContent)} suppressContentEditableWarning={true}>
                                {item.observed_condition}
                            </td>
                            <td>
                                {item.vender_inventory_label} {/* Display Vendor Label */}
                            </td>
                            <td>
                                <button onClick={() => handleDelete(item.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ItemList;
