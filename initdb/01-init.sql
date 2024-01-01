-- Creating the vendors table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- Creating the purchase_orders table
CREATE TABLE purchase_orders (
    id INT AUTO_INCREMENT UNIQUE PRIMARY KEY,
    vendor_id INT,
    order_date DATE,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id)
);

-- Creating the items table
CREATE TABLE items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upc INT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    purchase_price DECIMAL(10,2) CHECK (purchase_price >= 0),
    sale_price DECIMAL(10,2) CHECK (sale_price >= 0),
    vendor_id INT,
    purchase_order_id INT,
    observed_condition VARCHAR(255),
    progress ENUM('not received', 'received', 'tested', 'listed', 'sold', 'junk') NOT NULL DEFAULT 'not received',
    FOREIGN KEY (vendor_id) REFERENCES vendors(id),
    FOREIGN KEY (purchase_order_id) REFERENCES purchase_orders(id)
);

