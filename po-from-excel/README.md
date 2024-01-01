# PO-From-Excel App

## Overview
The PO-From-Excel App is a React-based web application designed to facilitate the processing of purchase orders (POs) from Excel files. It aims to simplify the task of uploading, selecting relevant columns, and checking the validity of POs in an efficient and user-friendly manner.

## Key Features

### 1. **File Uploading and Processing**:
   - Implemented in `FileUploader.js`.
   - **Functionality**: Enables users to upload Excel files and processes them to extract data.
   - **Libraries Used**: Utilizes `react-dropzone` for handling file drops and `XLSX` for reading Excel files.
   - **Data Handling**: Converts the uploaded file into a format suitable for further processing.

### 2. **Column Selection**:
   - Located in `ColumnSelector.js`.
   - **Functionality**: Allows users to select and manage columns from the uploaded Excel file that are relevant to POs.
   - **State Management**: Manages states like selected columns, preview data, and PO numbers.
   - **User Interaction**: Provides a UI for users to select and review the desired columns.

### 3. **PO Checking**:
   - Defined in `POChecker.js`.
   - **Functionality**: Checks the existence and validity of PO numbers against a server or database.
   - **Server Interaction**: Makes HTTP requests (using `axios`) to a server endpoint for checking PO numbers.

### 4. **App Integration and State Management**:
   - Main application logic is in `App.js`.
   - **State Hooks**: Manages the state of the file data and selected columns.
   - **Component Integration**: Integrates the `FileUploader`, `ColumnSelector`, and `POChecker` components.

### 5. **Styling**:
   - The app's styling is handled via CSS, ensuring a visually appealing and responsive user interface.

### 6. **Testing**:
   - Basic component tests are provided in `App.test.js`.

## Installation and Setup

- Clone the repository.
- Install dependencies using `npm install`.
- Run the application using `npm start`.

## Testing

- Execute tests using `npm test` to ensure component functionality.

## Contribution Guidelines

- For contributing to the project, create a new branch for each feature or bugfix.
- Ensure adherence to coding standards and perform testing before submitting a pull request.
