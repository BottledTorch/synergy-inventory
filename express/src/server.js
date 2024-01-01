const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const server = express();
server.use(cors());

const itemsRoutes = require('./routes/itemRoutes.js');
const vendorsRoutes = require('./routes/vendorRoutes.js');
const purchaseOrdersRoutes = require('./routes/purchaseOrderRoutes.js');

server.use(bodyParser.json());

server.use('/items', itemsRoutes);
server.use('/vendors', vendorsRoutes);
server.use('/purchase_orders', purchaseOrdersRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
