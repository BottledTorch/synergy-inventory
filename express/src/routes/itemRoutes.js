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
    const { upc, name, current_location, description, notes, purchase_price, vendor_id, purchase_order_id, observed_condition, progress, isLot, quantity } = req.body;
    pool.query('INSERT INTO items (upc, name, current_location, description, notes, purchase_price, vendor_id, purchase_order_id, observed_condition, progress, isLot, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [upc, name, current_location, description, notes, purchase_price, vendor_id, purchase_order_id, observed_condition, progress, isLot, quantity], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Item created', itemId: results.insertId });
    });
});


// Update an item and record the changes
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { upc, name, current_location, description, notes, purchase_price, vendor_id, purchase_order_id, observed_condition, progress, isLot, quantity } = req.body;

    try {
        // Begin a transaction
        await pool.beginTransaction();

        // Fetch the current state of the item
        const [currentItem] = await pool.query('SELECT * FROM items WHERE id = ?', [id]);
        if (currentItem.length === 0) {
            await pool.rollback();
            return res.status(404).json({ message: 'Item not found' });
        }
        const currentData = currentItem[0];

        // Update the item
        await pool.query('UPDATE items SET upc = ?, name = ?, current_location = ?, description = ?, notes = ?, purchase_price = ?, vendor_id = ?, purchase_order_id = ?, observed_condition = ?, progress = ?, isLot = ?, quantity = ? WHERE id = ?', [upc, name, current_location, description, notes, purchase_price, vendor_id, purchase_order_id, observed_condition, progress, isLot, quantity, id]);

        // Insert a record into item_status_history if there are changes
        if (progress !== currentData.progress || quantity !== currentData.quantity || current_location !== currentData.current_location || description !== currentData.description) {
            await pool.query('INSERT INTO item_status_history (item_id, previous_status, new_status, previous_quantity, new_quantity, previous_location, new_location, previous_description, new_description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [id, currentData.progress, progress, currentData.quantity, quantity, currentData.current_location, current_location, currentData.description, description]);
        }

        // Commit the transaction
        await pool.commit();
        res.json({ message: 'Item updated and history recorded' });
    } catch (error) {
        // Rollback the transaction in case of an error
        await pool.rollback();
        res.status(500).json({ error: error.message });
    }
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
