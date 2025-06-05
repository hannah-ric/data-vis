import React, { useState } from 'react';
import { validateFile, FileValidationError } from '../utils/fileValidation';
import ErrorBoundary from './ErrorBoundary';

function FileUploadContent({ onFileLoaded }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      // Validate file before processing
      validateFile(file);
      
      // Pass validated file to parent
      await onFileLoaded(file);
    } catch (err) {
      if (err instanceof FileValidationError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while processing the file');
        console.error('File upload error:', err);
      }
      // Reset file input
      e.target.value = '';
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      border: '2px dashed #ccc',
      borderRadius: '8px',
      textAlign: 'center',
      backgroundColor: '#f9f9f9',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginTop: 0 }}>Upload Data File</h3>
      <p style={{ color: '#666', fontSize: '14px' }}>
        Supported formats: CSV, JSON • Max size: 50MB
      </p>
      
      <input
        type="file"
        accept=".csv,.json"
        onChange={handleChange}
        disabled={loading}
        style={{
          padding: '10px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      />
      
      {loading && (
        <p style={{ color: '#0066cc', marginTop: '10px' }}>
          Processing file...
        </p>
      )}
      
      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '4px',
          color: '#c00'
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

export default function FileUpload({ onFileLoaded }) {
  return (
    <ErrorBoundary
      title="File Upload Error"
      message="There was a problem with the file upload component."
    >
      <FileUploadContent onFileLoaded={onFileLoaded} />
    </ErrorBoundary>
  );
}
