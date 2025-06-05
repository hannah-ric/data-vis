import React, { useState, useEffect, useCallback } from 'react';
import { useFileProcessor } from './hooks/useFileProcessor';
import useDataAnalysis from './hooks/useDataAnalysis';
import useKeyboardShortcuts, { SHORTCUTS } from './hooks/useKeyboardShortcuts';
import FileUpload from './components/FileUpload';
import DataSummary from './components/DataSummary';
import ChartConfiguration from './components/ChartConfiguration';
import Visualization from './components/Visualization';
import ErrorBoundary from './components/ErrorBoundary';
import DatasetTabs from './components/DatasetTabs';
import RVisualizationPanel from './components/RVisualizationPanel';
import ConnectionStatus from './components/ConnectionStatus';
import dataStorage from './utils/dataStorage';
import commandHistory, { UpdateChartConfigCommand } from './utils/commandHistory';
import './App.css';

function AppContent() {
  const { data, handleFileUpload, error } = useFileProcessor();
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  const [activeData, setActiveData] = useState(null);
  const summary = useDataAnalysis(activeData);
  const [chartConfig, setChartConfig] = useState({ type: 'bar', x: '', y: '' });
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });
  const [showRPanel, setShowRPanel] = useState(false);

  // Load datasets from storage on mount
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        const storedDatasets = await dataStorage.getAllDatasets();
        if (storedDatasets.length > 0) {
          setDatasets(storedDatasets);
          setActiveDatasetId(storedDatasets[0].id);
          setActiveData(storedDatasets[0].data);
        }
      } catch (error) {
        console.error('Failed to load datasets:', error);
      }
    };
    loadDatasets();
  }, []);

  // Listen to command history changes
  useEffect(() => {
    const handleHistoryChange = (state) => {
      setHistoryState(state);
    };
    commandHistory.addListener(handleHistoryChange);
    return () => commandHistory.removeListener(handleHistoryChange);
  }, []);

  // Handle new file upload
  useEffect(() => {
    const saveNewDataset = async () => {
      if (data && data.length > 0) {
        try {
          // Detect file type from the file that was processed
          const fileType = (() => {
            if (window._lastUploadedFile) {
              const ext = window._lastUploadedFile.name.toLowerCase().split('.').pop();
              return ext;
            }
            return 'unknown';
          })();
          
          const metadata = {
            name: `Dataset ${datasets.length + 1}`,
            type: fileType,
            uploadedAt: new Date().toISOString()
          };
          const id = await dataStorage.saveDataset(data, metadata);
          const newDataset = await dataStorage.getDataset(id);
          
          setDatasets(prev => [...prev, newDataset]);
          setActiveDatasetId(id);
          setActiveData(data);
        } catch (error) {
          console.error('Failed to save dataset:', error);
        }
      }
    };
    saveNewDataset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]); // Removed datasets.length to prevent infinite loop

  // Update chart config when data changes
  useEffect(() => {
    if (summary && summary.columns.length >= 2) {
      setChartConfig((prev) => {
        if (prev.x || prev.y) return prev;
        return { ...prev, x: summary.columns[0], y: summary.columns[1] };
      });
    }
  }, [summary]);

  const handleSelectDataset = useCallback(async (datasetId) => {
    try {
      const dataset = await dataStorage.getDataset(datasetId);
      if (dataset) {
        setActiveDatasetId(datasetId);
        setActiveData(dataset.data);
        // Reset chart config for new dataset
        if (dataset.data && dataset.data.length > 0) {
          const columns = Object.keys(dataset.data[0]);
          if (columns.length >= 2) {
            setChartConfig({ type: 'bar', x: columns[0], y: columns[1] });
          }
        }
      }
    } catch (error) {
      console.error('Failed to load dataset:', error);
    }
  }, []);

  const handleDeleteDataset = useCallback(async (datasetId) => {
    try {
      await dataStorage.deleteDataset(datasetId);
      setDatasets(prev => prev.filter(d => d.id !== datasetId));
      
      // If deleted dataset was active, switch to another
      if (activeDatasetId === datasetId) {
        const remainingDatasets = datasets.filter(d => d.id !== datasetId);
        if (remainingDatasets.length > 0) {
          handleSelectDataset(remainingDatasets[0].id);
        } else {
          setActiveDatasetId(null);
          setActiveData(null);
        }
      }
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  }, [activeDatasetId, datasets, handleSelectDataset]);

  const handleRenameDataset = useCallback(async (datasetId, newName) => {
    try {
      await dataStorage.updateDataset(datasetId, { name: newName });
      setDatasets(prev => prev.map(d => 
        d.id === datasetId ? { ...d, name: newName } : d
      ));
    } catch (error) {
      console.error('Failed to rename dataset:', error);
    }
  }, []);

  const handleChartConfigChange = useCallback((newConfig) => {
    const command = new UpdateChartConfigCommand(
      chartConfig,
      chartConfig,
      newConfig,
      setChartConfig
    );
    commandHistory.execute(command);
  }, [chartConfig]);

  const resetConfig = () => {
    if (summary && summary.columns.length >= 2) {
      handleChartConfigChange({ type: 'bar', x: summary.columns[0], y: summary.columns[1] });
    } else {
      handleChartConfigChange({ type: 'bar', x: '', y: '' });
    }
  };

  const handleUndo = () => {
    commandHistory.undo();
  };

  const handleRedo = () => {
    commandHistory.redo();
  };

  // Setup keyboard shortcuts
  useKeyboardShortcuts([
    { ...SHORTCUTS.UNDO, handler: handleUndo, enabled: historyState.canUndo },
    { ...SHORTCUTS.REDO, handler: handleRedo, enabled: historyState.canRedo },
    { ...SHORTCUTS.REDO_ALT, handler: handleRedo, enabled: historyState.canRedo },
  ]);

  return (
    <div className="app-container">
      <ConnectionStatus />
      <header className="app-header">
        <h1>Data Visualization App</h1>
        <div className="toolbar">
          <button 
            onClick={handleUndo} 
            disabled={!historyState.canUndo}
            title="Undo (Ctrl+Z)"
            className="toolbar-button"
          >
            ↶ Undo
          </button>
          <button 
            onClick={handleRedo} 
            disabled={!historyState.canRedo}
            title="Redo (Ctrl+Y)"
            className="toolbar-button"
          >
            ↷ Redo
          </button>
          <button
            onClick={() => setShowRPanel(!showRPanel)}
            title="Toggle R Visualization Panel"
            className="toolbar-button"
            style={{
              backgroundColor: showRPanel ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }}
          >
            🔬 R Studio
          </button>
        </div>
      </header>

      <FileUpload onFileLoaded={handleFileUpload} />
      {error && <p className="error-message">{error}</p>}

      {datasets.length > 0 && (
        <>
          <DatasetTabs
            datasets={datasets}
            activeDatasetId={activeDatasetId}
            onSelectDataset={handleSelectDataset}
            onDeleteDataset={handleDeleteDataset}
            onRenameDataset={handleRenameDataset}
          />
          
          <div className="main-content">
            <DataSummary summary={summary} />
            
            {summary && (
              <ChartConfiguration
                columns={summary.columns}
                config={chartConfig}
                onChange={handleChartConfigChange}
                onReset={resetConfig}
              />
            )}
            
            {summary && activeData && (
              <Visualization 
                data={activeData} 
                config={chartConfig}
                datasetId={activeDatasetId}
              />
            )}
            
            {showRPanel && activeData && (
              <RVisualizationPanel
                data={activeData}
                datasetId={activeDatasetId}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      title="Application Error"
      message="Something went wrong. Please refresh the page to try again."
      showDetails={true}
    >
      <AppContent />
    </ErrorBoundary>
  );
}
