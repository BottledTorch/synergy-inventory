import React from 'react';

const HomePage = () => {
  return (
    <div>
      <h1>Synergy Inventory System</h1>
      <nav>
        <ul>
          <li><a href="http://localhost:3000/">Express Backend</a></li>
          <li><a href="http://localhost:3001/">Check-in</a></li>
          <li><a href="http://localhost:3002/">PO from Excel</a></li>
          {/* Add other links here */}
        </ul>
      </nav>
    </div>
  );
};

export default HomePage;
