const express = require('express');
const pool = require('../database'); // Adjust the path if necessary
const router = express.Router();
const archiver = require('archiver');
const axios = require('axios');
const stream = require('stream');
const minioClient = require('../minioClient'); // Adjust the path to your minioClient.js file

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

// POST route to create a new image record
router.post('/', (req, res) => {
    const { item_id, image_url, image_description } = req.body;
    pool.query('INSERT INTO images (item_id, image_url, image_description) VALUES (?, ?, ?)', [item_id, image_url, image_description], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.status(201).json({ image_id: results.insertId });
    });
});
// Update an image
router.put('/:id', (req, res) => {
    const id = req.params.id;
    const updateData = req.body;

    // Construct SQL query dynamically based on provided fields
    const fieldsToUpdate = [];
    const valuesToUpdate = [];
    for (const [key, value] of Object.entries(updateData)) {
        fieldsToUpdate.push(`${key} = ?`);
        valuesToUpdate.push(value);
    }

    if (fieldsToUpdate.length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
    }

    const sqlQuery = `UPDATE images SET ${fieldsToUpdate.join(', ')} WHERE image_id = ?`;
    valuesToUpdate.push(id);

    pool.query(sqlQuery, valuesToUpdate, (error, results) => {
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
    const imageId = req.params.id;

    // First, get the image URL from the database
    pool.query('SELECT image_url FROM images WHERE image_id = ?', [imageId], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const imageUrl = results[0].image_url;
        const objectName = imageUrl.split('/').pop(); // Extract object name from URL

        // Delete the image from Minio
        minioClient.removeObject('itemimages', objectName, (minioError) => {
            if (minioError) {
                console.error("Error deleting image from Minio:", minioError);
                return res.status(500).json({ error: minioError });
            }

            // Image deleted from Minio, now delete from database
            pool.query('DELETE FROM images WHERE image_id = ?', [imageId], (dbError, dbResults) => {
                if (dbError) {
                    return res.status(500).json({ error: dbError });
                }

                if (dbResults.affectedRows > 0) {
                    res.json({ message: 'Image deleted' });
                } else {
                    res.status(404).json({ message: 'Image not found in database' });
                }
            });
        });
    });
});

//----------------------------------- Fancy Routes ------------------------------------------//

// Get all images for a specific item_id
router.get('/byItem/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    pool.query('SELECT * FROM images WHERE item_id = ?', [itemId], (error, results) => {
        if (error) {
            return res.status(500).json({ error });
        }
        res.json(results);
    });
});

// Route to download all images for a specific item_id as a zip file
router.get('/download/:itemId', (req, res) => {
    const itemId = req.params.itemId;

    // Fetch image URLs and IDs from the database for the given itemId
    const sqlQuery = 'SELECT image_url, image_id FROM images WHERE item_id = ?';
    pool.query(sqlQuery, [itemId], async (error, images) => {
        if (error) {
            console.error("Error fetching images: " + error.message);
            return res.status(500).send("Error fetching images: " + error.message);
        }

        if (images.length === 0) {
            return res.status(404).send("No images found for this item.");
        }

        try {
            // Create a zip stream
            const zip = archiver('zip', { zlib: { level: 9 } });
            const zipStream = new stream.PassThrough();

            // Set up the response headers
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename=images-${itemId}.zip`);

            // Pipe the zip stream to the response
            zip.pipe(zipStream);

            // Add each image to the zip
            for (const image of images) {
                const response = await axios.get(image.image_url, { responseType: 'stream' });
                zip.append(response.data, { name: `image-${image.image_id}.jpg` }); // Modify filename accordingly
            }

            // Finalize the zip file
            zip.finalize();

            // Send the zip file as the response
            zipStream.pipe(res);
        } catch (zipError) {
            console.error("Error creating zip file: " + zipError.message);
            res.status(500).send("Error downloading images: " + zipError.message);
        }
    });
});


module.exports = router;
