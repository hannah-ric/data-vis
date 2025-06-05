import React, { useState, useEffect } from 'react';
import ErrorBoundary from './ErrorBoundary';
import useRVisualization from '../hooks/useRVisualization';
import PromptInput from './PromptInput';
import RCodeEditor from './RCodeEditor';
import RVisualizationOutput from './RVisualizationOutput';

function RVisualizationPanelContent({ data, datasetId }) {
  const {
    connected,
    executing,
    results,
    error,
    executeCode,
    executePrompt,
    cancelExecution,
    getTemplates,
    getSuggestions,
    clearResults
  } = useRVisualization();

  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [templates, setTemplates] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Load templates on mount
  useEffect(() => {
    getTemplates().then(result => {
      setTemplates(result.templates);
    }).catch(err => {
      console.error('Failed to load templates:', err);
    });
  }, [getTemplates]);

  // Get suggestions when data changes
  useEffect(() => {
    if (data && data.length > 0) {
      getSuggestions(data).then(result => {
        setSuggestions(result.suggestions);
      }).catch(err => {
        console.error('Failed to get suggestions:', err);
      });
    }
  }, [data, getSuggestions]);

  const handlePromptSubmit = (promptText) => {
    if (!promptText.trim() || !data) return;
    executePrompt(promptText, data);
    setPrompt(promptText);
  };

  const handleCodeExecute = () => {
    if (!code.trim() || !data) return;
    executeCode(code, data);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
    setCode(template.code);
    setShowCodeEditor(true);
  };

  const handleSuggestionSelect = (suggestion) => {
    const promptText = `Create a ${suggestion.type} visualization${
      suggestion.config ? ` with ${suggestion.config.x} and ${suggestion.config.y}` : ''
    }`;
    setPrompt(promptText);
    handlePromptSubmit(promptText);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '20px',
      marginTop: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{ margin: 0 }}>R Visualization Studio</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            display: 'inline-block',
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: connected ? '#4caf50' : '#f44336'
          }} />
          <span style={{ fontSize: '14px', color: '#666' }}>
            {connected ? 'Connected to R' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Prompt Input Section */}
      <div style={{ marginBottom: '20px' }}>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handlePromptSubmit}
          disabled={!connected || executing}
          placeholder="Describe the visualization you want (e.g., 'Show correlation between all numeric variables')"
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Quick Actions</h4>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowCodeEditor(!showCodeEditor)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2196f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showCodeEditor ? 'Hide' : 'Show'} Code Editor
          </button>
          
          {executing && (
            <button
              onClick={cancelExecution}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel Execution
            </button>
          )}
          
          {results.length > 0 && (
            <button
              onClick={clearResults}
              style={{
                padding: '8px 16px',
                backgroundColor: '#757575',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>Suggested Visualizations</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
            {suggestions.slice(0, 6).map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionSelect(suggestion)}
                style={{
                  padding: '12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#2196f3';
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e0e0e0';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <h5 style={{ margin: '0 0 4px 0', fontSize: '14px' }}>{suggestion.title}</h5>
                <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{suggestion.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Templates */}
      {templates && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '10px' }}>R Code Templates</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {Object.entries(templates).map(([key, template]) => (
              <button
                key={key}
                onClick={() => handleTemplateSelect(template)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#e3f2fd',
                  color: '#1976d2',
                  border: '1px solid #1976d2',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {template.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Code Editor */}
      {showCodeEditor && (
        <div style={{ marginBottom: '20px' }}>
          <RCodeEditor
            value={code}
            onChange={setCode}
            onExecute={handleCodeExecute}
            disabled={!connected || executing}
            template={selectedTemplate}
          />
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#ffebee',
          border: '1px solid #ffcdd2',
          borderRadius: '4px',
          color: '#c62828',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      <RVisualizationOutput
        results={results}
        executing={executing}
      />
    </div>
  );
}

export default function RVisualizationPanel(props) {
  return (
    <ErrorBoundary
      title="R Visualization Error"
      message="There was a problem with the R visualization panel."
    >
      <RVisualizationPanelContent {...props} />
    </ErrorBoundary>
  );
} 