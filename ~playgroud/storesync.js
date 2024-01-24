const express = require('express');
const pool = require('./database.js'); 
const axios = require('axios');
const { batchUpdateProducts } = require('./woocommerceService');
const { 
    getItemDetails,
    getItemImages,
    fetchEarliestChangeLogId,
    fetchLatestChangeLogId,
    fetchItemsByChangeLogId
} = require('./queries.js');

const app = express();
app.use(express.json());

// Function to fetch item details and images by itemIds
const getItemDetailsAndImages = async (itemIds) => {
    return Promise.all(itemIds.map(async itemId => {
        try {
            const itemResults = await getItemDetails(itemId);
            const item = itemResults[0];

            // If item not found, return null
            if (!item) return null;

            const imageResults = await getItemImages(itemId);
            item.images = imageResults.map(img => img.image_url);
            return item;
        } catch (error) {
            throw error;
        }
    }));
};

// Endpoint to get updates with version
app.get('/sync/:version', async (req, res) => {
    try {
        const changeLogId = parseInt(req.params.version);

        // Get earliest change log ID
        const earliestChangeLogId = await fetchEarliestChangeLogId();

        if (earliestChangeLogId > changeLogId) {
            res.status(201).send({error: 'version number is too early'})
        }


        // Get the latest change log ID
        const latestChangeLogId = await fetchLatestChangeLogId();

        // Fetch item IDs that have changed since the specified change log ID
        const actionDict = await fetchItemsByChangeLogId(changeLogId);

        // Separate items into create, update, and delete categories
        const createItems = [];
        const updateItems = [];
        const deleteItems = [];

        for (const itemId in actionDict) {
            const action = actionDict[itemId];
            if (action === 'INSERT') {
                createItems.push(itemId);
            } else if (action === 'UPDATE') {
                updateItems.push(itemId);
            } else if (action === 'DELETE') {
                deleteItems.push(itemId);
            }
        }

        // Fetch item details and images for create and update items
        let createItemsWithImages = await getItemDetailsAndImages(createItems);
        let updateItemsWithImages = await getItemDetailsAndImages(updateItems);

        // Filter out null items
        createItemsWithImages = createItemsWithImages.filter(item => item !== null);
        updateItemsWithImages = updateItemsWithImages.filter(item => item !== null);

        const batchUpdateResponse = await batchUpdateProducts(createItemsWithImages, updateItemsWithImages, deleteItems);
        // console.log('Batch update successful:', batchUpdateResponse);

        // Send the response
        res.send({
            version: latestChangeLogId,
        });
    } catch (error) {
        res.status(500).send({ error: 'Error processing the request' });
    }
});


// Endpoint for healthchecking
app.get('/update/:itemID', async (req, res) => {
    try {
        const itemID = parseInt(req.params.itemID);
        res.status(200).send();
    } catch (error) {
        res.status(500).send({ error: 'Error processing the request' });
    }
});

// Endpoint for healthchecking
app.get('/healthcheck', async (req, res) => {
    try {
        res.status(200).send();
    } catch (error) {
        res.status(500).send({ error: 'Error processing the request' });
    }
});

// WooCommerce has requested to recieve all of our products
app.get('/fromthetop', async (req, res) => {
    try {
        // Get the latest change log ID
        const latestVersion = await fetchLatestChangeLogId();

        res.status(200).send({version: latestVersion});
    } catch (error) {
        res.status(500).send({ error: 'Error processing the request' });
    }
});


// ------------------ Cleanup ----------------------

// Function to remove old entries from the change_log table (always keep the latest 20)
const removeOldChangeLogEntries = () => {
    const query = `
        DELETE cl FROM change_log cl
        LEFT JOIN (
            SELECT id FROM change_log
            ORDER BY change_time DESC
            LIMIT 20
        ) as recent_changes ON cl.id = recent_changes.id
        WHERE recent_changes.id IS NULL`;

    pool.query(query, (error, results) => {
        if (error) {
            console.error('Error removing old change_log entries:', error);
            return;
        }
        console.log(`Removed ${results.affectedRows} old change_log entries.`);
    });
};


// Schedule the task to run every hour
setInterval(removeOldChangeLogEntries, 3600000); // 3600000 milliseconds = 1 hour

// ----------------- MINIO STUFF --------------------------
app.get('/itemimages/:imagePath', async (req, res) => {
    const imagePath = req.params.imagePath;
    const minioUrl = `http://10.1.0.16:9000/itemimages/${imagePath}`;

    try {
        const response = await axios.get(minioUrl, {
            responseType: 'stream'
        });

        res.setHeader('Content-Type', response.headers['content-type']);
        response.data.pipe(res);
    } catch (error) {
        res.status(404).send('Image not found');
    }
});


// Start the Express server on port 6969
app.listen(6969, () => {
    console.log('Express server running on port 6969');
    removeOldChangeLogEntries(); // Run once at server start to clean up any existing old entries
});