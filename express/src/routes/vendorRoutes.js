const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const router = express.Router();

// Get all vendors
router.get('/', (req, res) => {
    pool.query('SELECT * FROM vendors', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Get a single vendor by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    pool.query('SELECT * FROM vendors WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(results[0]);
    });
});

// Create a new vendor
router.post('/', (req, res) => {
    const { name, description } = req.body;
    pool.query('INSERT INTO vendors (name, description) VALUES (?, ?)', [name, description], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Vendor created', vendorId: results.insertId });
    });
});

// Update a vendor
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;
    pool.query('UPDATE vendors SET name = ?, description = ? WHERE id = ?', [name, description, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor updated' });
    });
});

// Delete a vendor
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    pool.query('DELETE FROM vendors WHERE id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json({ message: 'Vendor deleted' });
    });
});

// ------------------------------- Special Routes --------------------------------//

// Get a single vendor by name
router.get('/name/:name', (req, res) => {
    const { name } = req.params;
    pool.query('SELECT * FROM vendors WHERE name = ?', [name], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        res.json(results[0]);
    });
});


module.exports = router;
