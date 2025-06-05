import React, { useEffect, useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function ConnectionStatus() {
  const [backendStatus, setBackendStatus] = useState('checking');
  const [rStatus, setRStatus] = useState('unknown');

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (response.ok) {
          const data = await response.json();
          setBackendStatus('connected');
          setRStatus(data.rAvailable ? 'available' : 'not available');
        } else {
          setBackendStatus('error');
        }
      } catch (error) {
        setBackendStatus('disconnected');
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (backendStatus === 'connected' && rStatus === 'available') {
    return null; // Don't show anything if everything is working
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      padding: '12px 20px',
      backgroundColor: backendStatus === 'disconnected' ? '#ffebee' : '#fff3cd',
      border: `1px solid ${backendStatus === 'disconnected' ? '#ffcdd2' : '#ffeaa7'}`,
      borderRadius: '4px',
      fontSize: '14px',
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: backendStatus === 'connected' ? '#4caf50' : '#f44336',
          display: 'inline-block'
        }} />
        <span>
          {backendStatus === 'checking' && 'Checking backend connection...'}
          {backendStatus === 'disconnected' && 'Backend server not running'}
          {backendStatus === 'connected' && rStatus === 'not available' && 'R not available'}
          {backendStatus === 'error' && 'Backend connection error'}
        </span>
      </div>
      {backendStatus === 'disconnected' && (
        <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
          Run: cd backend && npm run dev
        </div>
      )}
    </div>
  );
} 