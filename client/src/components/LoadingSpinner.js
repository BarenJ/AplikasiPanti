// src/components/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    background: '#f8f9fa'
  }}>
    <div className="text-center">
      <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="mt-3 text-muted">Memuat aplikasi...</p>
    </div>
  </div>
);

export default LoadingSpinner;