import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';
import axios from 'axios';
const server_address = process.env.EXPRESS_SERVER_ADDRESS;

const ColumnSelector = ({ data, onColumnsSelected, poNumber, onPONumberChange }) => {
  const [columns, setColumns] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState([]);
  const [selectedPurchasePrice, setSelectedPurchasePrice] = useState(null);
  const [selectedUPCCode, setSelectedUPCCode] = useState(null);
  const [selectedNotes, setSelectedNotes] = useState([]);
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

    // Handler for multi-select (Item Name and Notes)
    const handleMultiSelectChange = (selectedOption, setState) => {
      setState(selectedOption);
      // Update onColumnsSelected logic as needed
    };
  
    // Handler for single-select (Purchase Price and UPC Code)
    const handleSingleSelectChange = (selectedOption, setState) => {
      setState(selectedOption);
      // Update onColumnsSelected logic as needed
    };

  const handleItemNameChange = (value) => {
    setSelectedItemName(value);
    onColumnsSelected(value.map(v => v.value));
  };

  const handlePurchasePriceChange = (value) => {
    setSelectedPurchasePrice(value);
    onColumnsSelected(value.map(v => v.value));
  };

  const handleUPCCodeChange = (value) => {
    setSelectedUPCCode(value);
    onColumnsSelected(value.map(v => v.value));
  };

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
          onChange={(value) => handleMultiSelectChange(value, setSelectedItemName)}
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
          onChange={(value) => handleSingleSelectChange(value, setSelectedPurchasePrice)}
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
          onChange={(value) => handleSingleSelectChange(value, setSelectedUPCCode)}
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
          onChange={(value) => handleMultiSelectChange(value, setSelectedNotes)}
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
