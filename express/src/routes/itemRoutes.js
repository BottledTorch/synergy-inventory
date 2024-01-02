const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const router = express.Router();

// Get all items
router.get('/', (req, res) => {
    pool.query('SELECT * FROM items', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Get a single item by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM items WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json(results[0]);
    });
});

// Create a new item
router.post('/', (req, res) => {
    const { upc, name, description, notes, purchase_price, sale_price, vendor_id, purchase_order_id, observed_condition, progress } = req.body;
    pool.query('INSERT INTO items (upc, name, description, notes, purchase_price, sale_price, vendor_id, purchase_order_id, observed_condition, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [upc, name, description, notes, purchase_price, sale_price, vendor_id, purchase_order_id, observed_condition, progress], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Item created', itemId: results.insertId });
    });
});

// Update an item
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { upc, name, description, notes, purchase_price, sale_price, vendor_id, purchase_order_id, observed_condition, progress } = req.body;
    pool.query('UPDATE items SET upc = ?, name = ?, description = ?, notes = ?, purchase_price = ?, sale_price = ?, vendor_id = ?, purchase_order_id = ?, observed_condition = ?, progress = ? WHERE id = ?', [upc, name, description, notes, purchase_price, sale_price, vendor_id, purchase_order_id, observed_condition, progress, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item updated' });
    });
});

// Delete an item
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM items WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Item not found' });
        }
        res.json({ message: 'Item deleted' });
    });
});

module.exports = router;
