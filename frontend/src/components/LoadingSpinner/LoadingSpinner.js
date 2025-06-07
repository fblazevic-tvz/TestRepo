import React from 'react';
import './LoadingSpinner.css'; 

function LoadingSpinner() {
  return (
    <div className="spinner-container" role="status">
      <div className="loading-spinner" aria-hidden="true">
      </div>
      <p className="spinner-text">Loading...</p>
    </div>
  );
}

export default LoadingSpinner;