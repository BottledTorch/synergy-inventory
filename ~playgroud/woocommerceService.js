const WooCommerceRestApi = require("@woocommerce/woocommerce-rest-api").default;
const pool = require('./database.js'); 

const api = new WooCommerceRestApi({
  url: 'http://10.1.0.88/wordpress', // Your store URL
  consumerKey: 'ck_339498c847ca4ebc1e485bb71f12ab8384cbecab', // Your consumer key
  consumerSecret: 'cs_442d8fdee7ee8b934e79ac40446364fcf11ee32b', // Your consumer secret
  version: 'wc/v3' // WooCommerce API version
});

function transformToWooCommerceProduct(item) {
  const product = {
    sku: item.id,
    name: item.name,
    description: item.description,
    short_description: item.description,
    regular_price: item.estimated_sale_price.toString(),
    images: item.images.map(url => ({ src: url.replace('http://10.1.0.16:9000', 'https://synergy-api.spacecamp.dev') }))
    // Add other WooCommerce product fields as needed
  };

  if (item.woocommerceID) {
    product.id = item.woocommerceID; // Set WooCommerce product ID for existing items
  }

  return product;
}

async function batchUpdateProducts(createItems, updateItems, deleteItems) {
  // Function to create batches of items with a combined limit
  function createBatches(createItems, updateItems, deleteItems, limit) {
    const batches = [];
    let batch = { create: [], update: [], delete: [] };

    for (const item of [...createItems, ...updateItems, ...deleteItems]) {
      if (item.id) {
        // Existing items for update or delete
        if (batch.update.length + batch.delete.length + batch.create.length < limit) {
          if (updateItems.includes(item)) {
            batch.update.push(item);
          } else if (deleteItems.includes(item)) {
            batch.delete.push(item);
          }
        } else {
          batches.push(batch);
          batch = { create: [], update: [], delete: [] };
          if (updateItems.includes(item)) {
            batch.update.push(item);
          } else if (deleteItems.includes(item)) {
            batch.delete.push(item);
          }
        }
      } else {
        // New items for create
        if (batch.create.length + batch.update.length + batch.delete.length < limit) {
          batch.create.push(item);
        } else {
          batches.push(batch);
          batch = { create: [], update: [], delete: [] };
          batch.create.push(item);
        }
      }
    }

    // Add the last batch if it has items
    if (batch.create.length || batch.update.length || batch.delete.length) {
      batches.push(batch);
    }

    return batches;
  }

  // Transform items and create batches
  const transformedCreateItems = createItems.map(transformToWooCommerceProduct);
  const transformedUpdateItems = updateItems.map(transformToWooCommerceProduct);
  const transformedDeleteItems = deleteItems.map(itemId => ({ id: itemId }));
  const batches = createBatches(transformedCreateItems, transformedUpdateItems, transformedDeleteItems, 100);

  // Perform batch updates
  console.log('here')
  for (let i = 0; i < batches.length; i++) {
    try {
      const response = await api.post('products/batch', batches[i]);
      // console.log(`Batch update response for batch ${i + 1}:`, response.data);

      // Handle the response to update woocommerceID in your MySQL database
      // This should only be necessary for newly created items
      if (response.data.create) {
        for (const createdItem of response.data.create) {
            const sku = createdItem.sku;
            const woocommerceID = createdItem.id;

            // Update the woocommerceID in the MySQL database
            const updateQuery = 'UPDATE items SET woocommerceID = ? WHERE id = ?';
            await pool.query(updateQuery, [woocommerceID, sku]);
        }
    }
    } catch (error) {
      console.error(`Error in batch update for batch ${i + 1}:`, error);
      throw error;
    }
  }
}

module.exports = {
  batchUpdateProducts
};