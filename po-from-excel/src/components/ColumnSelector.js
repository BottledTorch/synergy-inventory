import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS;

const ColumnSelector = ({ data, handleItemNameChange, handlePurchasePriceChange, handleUPCCodeChange, handleNotesChange, handleVendorInventoryLabelChange, poNumber, onPONumberChange }) => {
  const [columns, setColumns] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState([]);
  const [selectedPurchasePrice, setSelectedPurchasePrice] = useState(null);
  const [selectedUPCCode, setSelectedUPCCode] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [selectedVendorInventoryLabel, setSelectedVendorInventoryLabel] = useState([])
  const [previewData, setPreviewData] = useState([]);
  const [isPOLoading, setPOLoading] = useState(false);
  const [poError, setPOError] = useState('');

  useEffect(() => {
    if (data && data.length > 0) {
      const columnOptions = Object.keys(data[0]).map(key => ({
        value: key,
        label: key
      }));
      setColumns(columnOptions);
      setPreviewData(data.slice(0, 2));
    }
  }, [data]);

  const onItemNameChange = (value) => {
    setSelectedItemName(value);
    handleItemNameChange(value.map(v => v.value));
  };

  const onPurchasePriceChange = (value) => {
    setSelectedPurchasePrice(value);
    handlePurchasePriceChange(value);
  };

  const onUPCCodeChange = (value) => {
    setSelectedUPCCode(value);
    handleUPCCodeChange(value);
  };

  const onNotesChange = (value) => {
    console.log(value.value)
    setSelectedNotes(value);
    handleNotesChange(value.map(v => v.value));
  };

  const onVendorInventoryLabelChange = (value) => {
    console.log(value.value)
    setSelectedVendorInventoryLabel(value)
    handleVendorInventoryLabelChange(value);
  }

  const checkPONumberExists = async () => {
    setPOLoading(true);
    try {
      const response = await axios.get(`http://${server_address}/purchase_orders/${poNumber}`);
      if (response.data.id == poNumber) {
        setPOError('This PO number is already present in the database.');
      } else {
        setPOError('');
      }
    } catch (error) {
      if (error.response && error.response.status !== 404) {
        setPOError('Failed to check PO number. Please try again.');
        console.error('There was an error checking the PO number:', error);
      } else {
        setPOError('');
      }
    }
    setPOLoading(false);
  };

  const handlePONumberChange = (e) => {
    onPONumberChange(e.target.value);
  };

  const handlePONumberBlur = () => {
    if (poNumber) {
      checkPONumberExists();
    }
  };

  return (
    <div>
      <div style={selectorStyle}>
            <label htmlFor="po-number">PO Number:</label>
            <input
            type="text"
            id="po-number"
            value={poNumber}
            onChange={handlePONumberChange}
            onBlur={handlePONumberBlur} // Trigger check when input loses focus
            placeholder="Enter PO number"
            disabled={isPOLoading}
            />

            {poError && <p style={{ color: 'red' }}>{poError}</p>}
        </div>

      <div style={selectorStyle}>
        <label htmlFor="item-name-select">Item Name:</label>
        <CreatableSelect
          isMulti
          id="item-name-select"
          name="item-name-select"
          options={columns}
          value={selectedItemName}
          onChange={(value) => onItemNameChange(value)}
          classNamePrefix="select"
        />
      </div>

      <div style={selectorStyle}>
        <label htmlFor="purchase-price-select">Purchase Price:</label>
        <CreatableSelect
          id="purchase-price-select"
          name="purchase-price-select"
          options={columns}
          value={selectedPurchasePrice}
          onChange={(value) => onPurchasePriceChange(value)}
          classNamePrefix="select"
        />
      </div>

      <div style={selectorStyle}>
        <label htmlFor="upc-code-select">UPC Code:</label>
        <CreatableSelect
          id="upc-code-select"
          name="upc-code-select"
          options={columns}
          value={selectedUPCCode}
          onChange={(value) => onUPCCodeChange(value)}
          classNamePrefix="select"
        />
      </div>

      <div style={selectorStyle}>
        <label htmlFor="notes-select">Notes:</label>
        <CreatableSelect
          isMulti
          id="notes-select"
          name="notes-select"
          options={columns}
          value={selectedNotes}
          onChange={(value) => onNotesChange(value)}
          classNamePrefix="select"
        />
      </div>

      <div style={selectorStyle}>
        <label htmlFor="vendor-inventory-label-select">Vendor Inventory Number:</label>
        <CreatableSelect
          id="vendor-inventory-label"
          name="vendor-inventory-label"
          options={columns}
          value={selectedVendorInventoryLabel}
          onChange={(value) => onVendorInventoryLabelChange(value)}
          classNamePrefix="select"
        />
      </div>

      <div style={previewStyle}>
            <h3>Data Preview:</h3>
            <table className="data-preview">
            <thead>
                <tr>
                {columns.map(col => (
                    <th key={col.value}>{col.label}</th>
                ))}
                </tr>
            </thead>
            <tbody>
                {previewData.map((row, index) => (
                <tr key={index}>
                    {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                    ))}
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
};

const selectorStyle = {
  margin: '10px 0'
};

const previewStyle = {
  marginTop: '20px',
  overflowX: 'auto'
};

export default ColumnSelector;
