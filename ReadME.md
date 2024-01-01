# Synergy Inventory: README

## Overview
Synergy Inventory is a comprehensive inventory management system designed to streamline the process of tracking and managing inventory items. It consists of several interconnected components, each serving a specific purpose within the inventory management workflow.

### Components
1. **Check-In Application**: A React-based web application for checking in items into inventory. [Check-In README](https://github.com/BottledTorch/synergy-inventory/blob/main/checkin/README.md)
2. **PO-From-Excel Application**: Facilitates processing of purchase orders from Excel files. [PO-From-Excel README](https://github.com/BottledTorch/synergy-inventory/blob/main/po-from-excel/README.md)
3. **Sold Application**: Manages items that have been sold. [Sold README](https://github.com/BottledTorch/synergy-inventory/blob/main/sold/README.md)
4. **Express Backend**: A Node.js Express server that handles API requests for items, vendors, and purchase orders. [Server Code](https://github.com/BottledTorch/synergy-inventory/blob/main/express/src/server.js)

### Key Features
- **Item Management**: Create, update, and delete inventory items.
- **Purchase Order Processing**: Upload and process purchase orders from Excel files.
- **Vendor Management**: Manage vendor information.
- **Sales Tracking**: Track items that have been sold.

### Installation and Setup
1. Clone the repository.
2. Navigate to each application directory (`checkin`, `po-from-excel`, `sold`) and install dependencies using `npm install`.
3. Set up the Express backend by navigating to the `express` directory and following the same steps.
4. Use `docker-compose` to set up and run the entire application stack. [Docker Compose File](https://github.com/BottledTorch/synergy-inventory/blob/main/docker-compose.yml)

### Database Initialization
- Initialize the database using the provided SQL script. [Initialization Script](https://github.com/BottledTorch/synergy-inventory/blob/main/initdb/01-init.sql)

### Security
- Generate secret files for MySQL credentials as mentioned in [info.txt](https://github.com/BottledTorch/synergy-inventory/blob/main/info.txt).
