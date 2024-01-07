import React from 'react';

const CheckoutItem = ({ item, salePrice, handleSalePriceChange, handleUpdate }) => {
    return (
        <div>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Notes</th>
                            <th>Quantity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{item.name}</td>
                            <td>{item.description}</td>
                            <td>{item.notes}</td>
                            <td>{item.quantity}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <br />
                <p>Sale Price: </p>
            <div className="sale-price-container">
                <input
                    type="number"
                    value={salePrice}
                    onChange={handleSalePriceChange}
                    placeholder="Sale Price ($.$$)"
                />
            </div>
        </div>
    );
};

export default CheckoutItem;
