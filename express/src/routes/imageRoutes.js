const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const router = express.Router();

// Get all images
router.get('/', (req, res) => {
    pool.query('SELECT * FROM images', (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Get a single image
router.get('/:id', (req, res) => {
    const id = req.params.id;
    pool.query('SELECT * FROM images WHERE image_id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    });
});

// Create a new image
router.post('/', (req, res) => {
    const { item_id, image_url, image_description } = req.body;
    pool.query('INSERT INTO images (item_id, image_url, image_description) VALUES (?, ?, ?)', [item_id, image_url, image_description], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ message: 'Image created', image_id: results.insertId });
    });
});

// Update an image
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const { item_id, image_url, image_description } = req.body;
    pool.query('UPDATE images SET item_id = ?, image_url = ?, image_description = ? WHERE image_id = ?', [item_id, image_url, image_description, id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows > 0) {
            res.json({ message: 'Image updated' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    });
});

// Delete an image
router.delete('/:id', (req, res) => {
    const id = req.params.id;
    pool.query('DELETE FROM images WHERE image_id = ?', [id], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        if (results.affectedRows > 0) {
            res.json({ message: 'Image deleted' });
        } else {
            res.status(404).json({ message: 'Image not found' });
        }
    });
});

module.exports = router;
