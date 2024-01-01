const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const router = express.Router();


// Get all purchase orders
router.get('/', (req, res) => {
    pool.query('SELECT * FROM purchase_orders', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Get a single purchase order by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM purchase_orders WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.json(results[0]);
    });
});

// Create a new purchase order
router.post('/', (req, res) => {
    const { vendor_id, order_date } = req.body;
    pool.query('INSERT INTO purchase_orders (vendor_id, order_date) VALUES (?, ?)', [vendor_id, order_date], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Purchase order created', purchaseOrderId: results.insertId });
    });
});


// Update a purchase order
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { vendor_id, order_date } = req.body;
    pool.query('UPDATE purchase_orders SET vendor_id = ?, order_date = ? WHERE id = ?', [vendor_id, order_date, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.json({ message: 'Purchase order updated' });
    });
});

// Delete a purchase order
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM purchase_orders WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Purchase order not found' });
        }
        res.json({ message: 'Purchase order deleted' });
    });
});

// ----------------------- SPECIAL ROUTES ------------------------------------------//

// Get all items for a specific purchase order
router.get('/:id/items', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM items WHERE purchase_order_id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Create a new purchase order with a specified ID
router.post('/with-id', (req, res) => {
    const { id, vendor_id, order_date } = req.body;

    // Check if the provided ID already exists
    pool.query('SELECT * FROM purchase_orders WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length > 0) {
            return res.status(400).json({ message: 'Purchase order ID already exists' });
        }

        // If ID does not exist, proceed to create a new purchase order
        pool.query('INSERT INTO purchase_orders (id, vendor_id, order_date) VALUES (?, ?, ?)', [id, vendor_id, order_date], (error, results) => {
            if (error) {
                return res.status(500).json({ error });
            }
            res.status(201).json({ message: 'Purchase order created with specified ID', purchaseOrderId: id });
        });
    });
});


router.get('/check/:poNumber')

module.exports = router;

module.exports = router;
