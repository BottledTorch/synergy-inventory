const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const salesRouter = express.Router();

// Create a new sale record
salesRouter.post('/', (req, res) => {
    const { item_id, sale_price, sale_date, sale_source } = req.body;
    pool.query('INSERT INTO sales (item_id, sale_price, sale_date, sale_source) VALUES (?, ?, ?, ?)', [item_id, sale_price, sale_date, sale_source], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Sale record created', saleId: results.insertId });
    });
});

// Get all sales records
salesRouter.get('/', (req, res) => {
    pool.query('SELECT * FROM sales', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

module.exports = salesRouter;
