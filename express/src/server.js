const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Minio = require('minio');
const fs = require('fs')

const MINIO_HOST = process.env.MINIO_HOST
const MINIO_PORT = process.env.MINIO_PORT

// MinIO client configuration
const minioClient = new Minio.Client({
    endPoint: MINIO_HOST, // Set to 'minio' if using Docker's internal network
    port: parseInt(MINIO_PORT, 10),
    useSSL: false, // Set to true if SSL is configured
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: fs.readFileSync(process.env.MINIO_ROOT_PASSWORD_FILE, 'utf8').trim()
});


const server = express();
server.use(cors());

const itemsRoutes = require('./routes/itemRoutes.js');
const vendorsRoutes = require('./routes/vendorRoutes.js');
const purchaseOrdersRoutes = require('./routes/purchaseOrderRoutes.js');
const salesRoutes = require('./routes/salesRoutes.js');
const itemStatusHistoryRoutes = require('./routes/itemStatusHistoryRoutes.js');

server.use(bodyParser.json());

server.use('/items', itemsRoutes);
server.use('/vendors', vendorsRoutes);
server.use('/purchase_orders', purchaseOrdersRoutes);
server.use('/sales', salesRoutes);
server.use('/item_status_history', itemStatusHistoryRoutes);

server.get('/generate-presigned-urls', async (req, res) => {
    const { itemID, fileCount } = req.query;
    try {
        const presignedUrls = [];
        const accessUrls = [];
        for (let i = 0; i < fileCount; i++) {
            const objectName = `ITM-${itemID}-${i}`;
            const presignedUrl = await minioClient.presignedPutObject('itemimages', objectName, 60 * 60); // 1 hour expiry
            presignedUrls.push(presignedUrl);

            // Assuming the MinIO server is accessible at the same address and the images are publicly accessible
            const accessUrl = `http://${MINIO_HOST}:${MINIO_PORT}/itemimages/${objectName}`;
            accessUrls.push(accessUrl);
        }
        res.json({ presignedUrls, accessUrls });
    } catch (error) {
        res.status(500).send("Error generating URLs: " + error.message);
    }
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
