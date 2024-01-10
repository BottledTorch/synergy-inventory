import React, {	useState } from 'react';
import axios from 'axios';
import FileUploader from './components/FileUploader';
import ColumnSelector from './components/ColumnSelector';
import VendorSelector from './components/VendorSelector';
import './App.css';

const server_address = process.env.REACT_APP_EXPRESS_SERVER_ADDRESS;


function App() {
	const [fileData, setFileData] = useState(null);
	const [itemNameColumns, setItemNameColumns] = useState(null);
    const [purchasePriceColumn, setPurchasePriceColumn] = useState(null);
    const [upcColumn, setUPCColumn] = useState(null);
    const [notesColumns, setNotesColumns] = useState(null);
    const [vendorInventoryLabelColumn, setvendorInventoryLabelColumn] = useState('');

	const [poNumber, setPONumber] = useState(''); // New state for storing PO number
	const [vendor, setVendor] = useState('')
	const [orderDate, setOrderDate] = useState('');
    

	const handleFileLoaded = (data) => {
		setFileData(data);
	};

	const handleItemNameChange = (columns) => {
		setItemNameColumns(columns);
	};

    const handlePurchasePriceChange = (columns) => {
		setPurchasePriceColumn(columns);
	};

    const handleUPCCodeChange = (columns) => {
		setUPCColumn(columns);
	};

    const handleNotesChange = (columns) => {
		setNotesColumns(columns);
	};

    const handleVendorInventoryLabelChange = (newVendorInventoryLabel) => {
		setvendorInventoryLabelColumn(newVendorInventoryLabel);
	};


	const handlePONumberChange = (newPONumber) => {
		setPONumber(newPONumber);
	};

	const handleVendorChange = (newVendor) => {
		setVendor(newVendor);
	};


	const handleDateChange = (e) => {
		const dateValue = e.target.value;
		// Convert from YYYY-MM-DD to MM/DD/YYYY
		console.log(dateValue)
		const formattedDate = dateValue.split('-').reverse().join('/');
		console.log(formattedDate)
		setOrderDate(formattedDate);
	};


  const handleSubmit = async () => {
      console.log('fileData:', fileData);
      console.log('itemNameColumns:', itemNameColumns);
      console.log('purchasePriceColumn:', purchasePriceColumn);
      console.log('upcColumn:', upcColumn);
      console.log('notesColumns:', notesColumns);
      console.log('vendorInventoryLabelColumn:', vendorInventoryLabelColumn);
      console.log()
      console.log('PO Number:', poNumber);
      console.log('Vendor Name:', vendor);

      // Split the orderDate from MM/DD/YYYY and rearrange to YYYY-MM-DD
      const [dd, mm, yyyy] = orderDate.split('/');
      const formattedOrderDate = `${yyyy}-${mm}-${dd}`;
      console.log('Formatted Order Date:', formattedOrderDate);

      const failedItems = [];

      try {
          let vendorId = await checkOrCreateVendor(vendor);
          await createPurchaseOrder(vendorId);
          await createItems();
      } catch (error) {
          console.error('Error in process:', error);
          alert('An unexpected error occurred\n' + error.response.data.message);
      }

      const downloadFailedItems = () => {
        if (failedItems.length > 0) {
            const failedItemsText = failedItems.map(item => JSON.stringify(item, null, 2)).join('\n\n');
            const blob = new Blob([failedItemsText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'failed_items.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            alert('Some items failed to be added. Downloading the details of failed items.');
        }
    };

      async function checkOrCreateVendor(vendorName) {
          try {
              const response = await axios.get(`http://${server_address}/vendors/name/${vendorName}`);
              return response.data.id;
          } catch (error) {
              if (error.response && error.response.status === 404) {
                  const vendorResponse = await axios.post(`http://${server_address}/vendors`, { name: vendorName });
                  return vendorResponse.data.vendorId;
              } else {
                  throw new Error('Vendor check/create failed');
              }
          }
      }

      async function createPurchaseOrder(vendor_id) {
          const poResponse = await axios.post(`http://${server_address}/purchase_orders/with-id`, {
              id: poNumber,
              vendor_id: vendor_id,
              order_date: formattedOrderDate
          });
          console.log(`Purchase order created successfully with PO Number: ${poNumber}`);
      }

      async function createItems() {
        const successfulItems = [];
    
        for (const item of fileData) {
            const itemName = itemNameColumns.map(col => item[col]).join(' ');
            
            const itemPayload = {
                name: itemName,
                purchase_order_id: poNumber,
                progress: 'not received'
                // ... additional fields ...
            };
            
            if (purchasePriceColumn && item[purchasePriceColumn.value]) {
                itemPayload.purchase_price = item[purchasePriceColumn.value];
            }
            
            if (upcColumn && item[upcColumn.value]) {
                itemPayload.upc = item[upcColumn.value];
            }

            if (vendorInventoryLabelColumn && item[vendorInventoryLabelColumn.value]) {
                itemPayload.vender_inventory_label = item[vendorInventoryLabelColumn.value];
            }
            
            if (notesColumns && notesColumns.some(col => item[col])) {
                itemPayload.notes = notesColumns.map(col => item[col]).filter(Boolean).join(' ');
            }
            
    
            try {
                await axios.post(`http://${server_address}/items`, itemPayload);
                console.log("added: " + itemName);
                successfulItems.push(itemName);
            } catch (error) {
                failedItems.push(item);
            }
        }
    
        if (successfulItems.length > 0) {
            showSuccessModal(successfulItems);
        }
    
        if (failedItems.length > 0) {
            downloadFailedItems();
        }
    }
    
    function showSuccessModal(items) {
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.left = '50%';
        modal.style.top = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#d9d9d9';
        modal.style.padding = '20px';
        modal.style.zIndex = '1000';
    
        const title = document.createElement('h3');
        title.textContent = 'Successfully added items:';
        modal.appendChild(title);
    
        const itemList = document.createElement('div');
        itemList.style.backgroundColor = '#FFF'
        itemList.style.maxHeight = '200px';
        itemList.style.overflowY = 'scroll';
        itemList.style.border = '1px solid #CCC';
        itemList.style.marginTop = '10px';
        itemList.style.padding = '10px';
    
        items.forEach(item => {
            const itemElement = document.createElement('p');
            itemElement.textContent = item;
            itemList.appendChild(itemElement);
        });
    
        modal.appendChild(itemList);
    
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.onclick = function() {
            document.body.removeChild(modal);
        };
        modal.appendChild(closeButton);
    
        document.body.appendChild(modal);
    }
    
  };


  return (
    <div className="App">
        <h1>PO Order Upload</h1>
        <FileUploader onFileLoaded={handleFileLoaded} />
        {fileData && (
            <>
                <input 
                    type="date" 
                    value={orderDate.split('/').reverse().join('-')} 
                    onChange={handleDateChange} 
                    placeholder="MM/DD/YYYY"
                />
                <ColumnSelector 
                    data={fileData} 
                    handleItemNameChange={handleItemNameChange} 
                    handlePurchasePriceChange={handlePurchasePriceChange}
                    handleUPCCodeChange={handleUPCCodeChange}
                    handleNotesChange={handleNotesChange}
                    handleVendorInventoryLabelChange={handleVendorInventoryLabelChange}
                    poNumber={poNumber}
                    onPONumberChange={handlePONumberChange}
                />
                <VendorSelector
                    vendor={vendor}
                    onVendorChange={handleVendorChange}
                />
            </>       
        )}
        <button onClick={handleSubmit}>Submit</button>
    </div>
  );    
}

export default App;
