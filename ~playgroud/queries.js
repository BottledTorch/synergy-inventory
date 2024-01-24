const pool = require('./database.js'); // Replace with the path to your MySQL pool configuration file

const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        pool.query(query, params, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

const getItemDetails = async (itemId) => {
    const query = 'SELECT id, name, current_location, description, estimated_sale_price, observed_condition, progress,  FROM items WHERE id = ?';
    return executeQuery(query, [itemId]);
};

const getItemImages = async (itemId) => {
    const query = 'SELECT image_url FROM images WHERE item_id = ?';
    return executeQuery(query, [itemId]);
};

const fetchLatestChangeLogId = async () => {
    const query = 'SELECT MAX(id) AS latestId FROM change_log';
    const results = await executeQuery(query, []);
    return results[0].latestId;
};

const fetchEarliestChangeLogId = async () => {
    const query = 'SELECT MIN(id) AS latestId FROM change_log';
    const results = await executeQuery(query, []);
    return results[0].latestId;
};

const fetchItemsByChangeLogId = async (changeLogId) => {
    let query, params;

    if (changeLogId) {
        // Query to get all actions for items that have changed since the specified change log ID
        query = `
            SELECT items.id, change_log.action
            FROM items 
            JOIN change_log ON items.id = change_log.item_id 
            WHERE change_log.id > ? 
            AND change_log.table_name = "items" 
            AND items.name IS NOT NULL 
            AND items.name != "" 
            AND items.description IS NOT NULL 
            AND items.description != "" 
            AND items.estimated_sale_price IS NOT NULL 
            AND items.progress IS NOT NULL 
            AND items.progress != ""`;
        params = [changeLogId];
    }

    const results = await executeQuery(query, params);

    // Create a dictionary to store actions for each item ID
    const itemActions = {};

    // Iterate through the results to gather all actions for each item ID
    results.forEach((row) => {
        const itemId = row.id;
        const action = row.action;

        if (!itemActions[itemId]) {
            // Initialize an array to store actions if it doesn't exist
            itemActions[itemId] = [];
        }

        // Push the action to the array
        itemActions[itemId].push(action);
    });

    // Decide the final action for each item ID based on priorities (DELETE > INSERT > UPDATE)
    const finalActions = {};
    Object.keys(itemActions).forEach((itemId) => {
        const actions = itemActions[itemId];
        let finalAction = "UPDATE"; // Default to UPDATE if no other actions are present

        if (actions.includes("DELETE")) {
            finalAction = "DELETE";
        } else if (actions.includes("INSERT")) {
            finalAction = "INSERT";
        }

        finalActions[itemId] = finalAction;
    });

    return finalActions;
};


module.exports = {
    getItemDetails,
    getItemImages,
    fetchEarliestChangeLogId,
    fetchLatestChangeLogId,
    fetchItemsByChangeLogId,
};
