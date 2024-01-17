import React from 'react';
import { Route, Routes } from 'react-router-dom';
import UploadPictures from './components/UploadPictures';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Upload Pictures</h1>
      </header>
      <Routes>
        <Route path="/item-id/:itemId" element={<UploadPictures />} />
      </Routes>
    </div>
  );
}

export default App;
