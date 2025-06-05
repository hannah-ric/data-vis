import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import dataStorage from '../utils/dataStorage';
import { exportData } from '../utils/dataExport';

function DatasetTabsContent({ datasets, activeDatasetId, onSelectDataset, onDeleteDataset, onRenameDataset }) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [contextMenu, setContextMenu] = useState(null);

  const handleTabClick = (datasetId) => {
    if (editingId !== datasetId) {
      onSelectDataset(datasetId);
    }
  };

  const handleRename = (dataset) => {
    setEditingId(dataset.id);
    setEditingName(dataset.name || `Dataset ${dataset.id}`);
    setContextMenu(null);
  };

  const handleRenameSubmit = async () => {
    if (editingName.trim() && editingId) {
      await onRenameDataset(editingId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const handleRenameCancel = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleContextMenu = (e, dataset) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      dataset
    });
  };

  const handleExport = async (dataset, format) => {
    try {
      const fullDataset = await dataStorage.getDataset(dataset.id);
      await exportData(fullDataset.data, format, dataset.name || `dataset_${dataset.id}`);
      setContextMenu(null);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export dataset');
    }
  };

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  return (
    <div style={{
      borderBottom: '2px solid #e0e0e0',
      backgroundColor: '#f5f5f5',
      padding: '0 10px',
      display: 'flex',
      alignItems: 'center',
      overflowX: 'auto',
      minHeight: '48px'
    }}>
      {datasets.map((dataset) => (
        <div
          key={dataset.id}
          onClick={() => handleTabClick(dataset.id)}
          onContextMenu={(e) => handleContextMenu(e, dataset)}
          style={{
            padding: '8px 16px',
            marginRight: '4px',
            backgroundColor: activeDatasetId === dataset.id ? '#fff' : 'transparent',
            border: activeDatasetId === dataset.id ? '2px solid #e0e0e0' : '2px solid transparent',
            borderBottom: activeDatasetId === dataset.id ? '2px solid #fff' : '2px solid transparent',
            borderRadius: '4px 4px 0 0',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            position: 'relative',
            bottom: activeDatasetId === dataset.id ? '-2px' : '0',
            transition: 'all 0.2s ease'
          }}
        >
          {editingId === dataset.id ? (
            <input
              type="text"
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
                if (e.key === 'Escape') handleRenameCancel();
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
              style={{
                padding: '2px 4px',
                border: '1px solid #ccc',
                borderRadius: '2px',
                fontSize: '14px',
                width: '150px'
              }}
            />
          ) : (
            <>
              <span style={{ fontSize: '14px' }}>
                {dataset.name || `Dataset ${dataset.id}`}
              </span>
              {dataset.rowCount && (
                <span style={{ fontSize: '12px', color: '#666' }}>
                  ({dataset.rowCount} rows)
                </span>
              )}
            </>
          )}
          
          {datasets.length > 1 && activeDatasetId === dataset.id && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm('Are you sure you want to delete this dataset?')) {
                  onDeleteDataset(dataset.id);
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                cursor: 'pointer',
                padding: '2px',
                fontSize: '16px',
                lineHeight: '1',
                marginLeft: '4px'
              }}
              title="Delete dataset"
            >
              ×
            </button>
          )}
        </div>
      ))}

      {/* Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            backgroundColor: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            zIndex: 1000,
            minWidth: '150px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => handleRename(contextMenu.dataset)}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Rename
          </button>
          
          <div style={{ borderTop: '1px solid #eee' }} />
          
          <button
            onClick={() => handleExport(contextMenu.dataset, 'csv')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Export as CSV
          </button>
          
          <button
            onClick={() => handleExport(contextMenu.dataset, 'json')}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 12px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              fontSize: '14px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Export as JSON
          </button>
          
          {datasets.length > 1 && (
            <>
              <div style={{ borderTop: '1px solid #eee' }} />
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this dataset?')) {
                    onDeleteDataset(contextMenu.dataset.id);
                    setContextMenu(null);
                  }
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#d32f2f'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#ffebee'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default function DatasetTabs(props) {
  return (
    <ErrorBoundary
      title="Dataset Tabs Error"
      message="There was a problem with the dataset tabs."
    >
      <DatasetTabsContent {...props} />
    </ErrorBoundary>
  );
} 