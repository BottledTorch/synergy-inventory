-- Initialize Database

-- Creating the vendors table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    on_time_delivery_rate DECIMAL(5,2),
    order_accuracy_rate DECIMAL(5,2),
    quality_rating DECIMAL(5,2)
);

-- Creating the purchase_orders table
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT,
    order_date DATE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    order_status ENUM('pending', 'completed', 'delayed'),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Creating the items table
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upc INT,
    name VARCHAR(255) NOT NULL,
    current_location TEXT,
    description TEXT,
    notes TEXT,
    purchase_price DECIMAL(10,2) CHECK (purchase_price >= 0),
    vender_inventory_label TEXT,
    vendor_id INT,
    purchase_order_id INT,
    observed_condition VARCHAR(255),
    progress ENUM('not received', 'received', 'tested', 'listed', 'sold', 'junk') NOT NULL DEFAULT 'not received',
    isLot TINYINT DEFAULT 0,
    quantity INT DEFAULT 1 CHECK (quantity >= 0),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
);

-- Creating the sales table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    sale_price DECIMAL(10,2),
    sale_date DATE,
    sale_source VARCHAR(255),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Creating the item_status_history table
CREATE TABLE item_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT,
    previous_status ENUM('not received', 'received', 'tested', 'listed', 'sold', 'junk'),
    new_status ENUM('not received', 'received', 'tested', 'listed', 'sold', 'junk'),
    previous_quantity INT,
    new_quantity INT,
    previous_location TEXT,
    new_location TEXT,
    previous_description TEXT,
    new_description TEXT,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (item_id) REFERENCES items(id)
);
