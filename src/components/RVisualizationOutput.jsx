import React from 'react';
import ExportOptions from './ExportOptions';

export default function RVisualizationOutput({ results, executing }) {
  // Add style tag once
  React.useEffect(() => {
    const styleId = 'r-viz-spinner-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (executing) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px'
      }}>
        <div style={{
          display: 'inline-block',
          width: '40px',
          height: '40px',
          border: '4px solid #e0e0e0',
          borderTopColor: '#2196f3',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ marginTop: '16px', color: '#666' }}>Executing R code...</p>
        <p style={{ fontSize: '12px', color: '#999' }}>This may take a few moments</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        color: '#666'
      }}>
        <p>No results yet. Enter a prompt or execute R code to see visualizations.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{ marginBottom: '16px' }}>Results</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {results.map((result, index) => (
          <div
            key={result.id || index}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div style={{
              backgroundColor: result.type === 'error' ? '#ffebee' : '#e8f5e9',
              padding: '8px 16px',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: result.type === 'error' ? '#c62828' : '#2e7d32'
              }}>
                {result.type === 'error' ? '❌ Error' : '✅ Success'}
              </span>
              <span style={{ fontSize: '12px', color: '#666' }}>
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
            </div>
            
            <div style={{ padding: '16px' }}>
              {result.type === 'error' ? (
                <div style={{ color: '#c62828' }}>
                  <pre style={{
                    margin: 0,
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '14px',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {result.error}
                  </pre>
                </div>
              ) : (
                <div>
                  {result.code && (
                    <div style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        Generated R Code:
                      </h4>
                      <pre style={{
                        backgroundColor: '#f5f5f5',
                        padding: '12px',
                        borderRadius: '4px',
                        fontFamily: 'Consolas, Monaco, monospace',
                        fontSize: '13px',
                        overflow: 'auto'
                      }}>
                        {result.code}
                      </pre>
                    </div>
                  )}
                  
                  {result.result && (
                    <div>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        Output:
                      </h4>
                      
                      {/* Check if result contains an image/plot */}
                      {result.result.output && result.result.output.includes('data:image') ? (
                        <div style={{ textAlign: 'center' }}>
                          <img
                            src={result.result.output}
                            alt="R Visualization"
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              border: '1px solid #e0e0e0',
                              borderRadius: '4px'
                            }}
                          />
                          <div style={{ marginTop: '10px' }}>
                            <ExportOptions
                              data={null}
                              svgRef={null}
                              chartRef={null}
                              filename={`r_plot_${index + 1}`}
                            />
                          </div>
                        </div>
                      ) : (
                        <pre style={{
                          backgroundColor: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '13px',
                          overflow: 'auto',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {result.result.output || JSON.stringify(result.result, null, 2)}
                        </pre>
                      )}
                      
                      {result.result.executionTime && (
                        <p style={{
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          Execution time: {result.result.executionTime}ms
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 