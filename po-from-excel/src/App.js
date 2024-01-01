import React, {	useState } from 'react';
import axios from 'axios';
import FileUploader from './components/FileUploader';
import ColumnSelector from './components/ColumnSelector';
import VendorSelector from './components/VendorSelector';
import './App.css';

function App() {
	const [fileData, setFileData] = useState(null);
	const [selectedColumns, setSelectedColumns] = useState(null);
	const [poNumber, setPONumber] = useState(''); // New state for storing PO number
	const [vendor, setVendor] = useState('')
	const [orderDate, setOrderDate] = useState('');

	const handleFileLoaded = (data) => {
		setFileData(data);
	};

	const handleColumnsSelected = (columns) => {
		setSelectedColumns(columns);
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
      console.log('selectedColumns:', selectedColumns);
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
              const response = await axios.get(`http://localhost:3000/vendors/name/${vendorName}`);
              return response.data.id;
          } catch (error) {
              if (error.response && error.response.status === 404) {
                  const vendorResponse = await axios.post('http://localhost:3000/vendors', { name: vendorName });
                  return vendorResponse.data.vendorId;
              } else {
                  throw new Error('Vendor check/create failed');
              }
          }
      }

      async function createPurchaseOrder(vendor_id) {
          const poResponse = await axios.post('http://localhost:3000/purchase_orders/with-id', {
              id: poNumber,
              vendor_id: vendor_id,
              order_date: formattedOrderDate
          });
          console.log(`Purchase order created successfully with PO Number: ${poNumber}`);
      }

      async function createItems() {
        const successfulItems = [];
    
        for (const item of fileData) {
            const itemName = selectedColumns.map(col => item[col]).join(' ');
            console.log(itemName)
            const itemPayload = {
                name: itemName,
                purchase_order_id: poNumber,
                progress: 'not received'
                // ... additional fields ...
            };
    
            try {
                await axios.post('http://localhost:3000/items', itemPayload);
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



	// This is a placeholder function and needs to be implemented according to your specific backend format.
	function convertToBackendFormat(fileData, selectedColumns) {
		// Check if fileData and selectedColumns are defined
		if (!fileData || !selectedColumns) {
			console.error('Invalid file data or selected columns');
			return [];
		}

		// Assuming fileData is an array of objects and selectedColumns is an object
		// with keys as the database fields and values as the selected column labels.
		return fileData.map(row => {
			let newRow = {};
			for (const [key, value] of Object.entries(selectedColumns)) {
				newRow[key] = row[value.value];
			}
			return newRow;
		});
	}


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
                    onColumnsSelected={handleColumnsSelected} 
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
