const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const itemStatusHistoryRouter = express.Router();

// Create a new item status history record
itemStatusHistoryRouter.post('/', (req, res) => {
    const { item_id, previous_status, new_status, notes } = req.body;
    pool.query('INSERT INTO item_status_history (item_id, previous_status, new_status, notes) VALUES (?, ?, ?, ?)', [item_id, previous_status, new_status, notes], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Item status history record created', historyId: results.insertId });
    });
});

// Get all item status history records
itemStatusHistoryRouter.get('/', (req, res) => {
    pool.query('SELECT * FROM item_status_history', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

module.exports = itemStatusHistoryRouter;