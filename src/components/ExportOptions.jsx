import React, { useState } from 'react';
import { exportToCSV, exportToJSON, exportChartAsPNG, exportD3AsSVG, exportD3AsPNG } from '../utils/dataExport';
import ErrorBoundary from './ErrorBoundary';

function ExportOptionsContent({ data, chartRef, svgRef, filename = 'export' }) {
  const [showMenu, setShowMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      switch (format) {
        case 'csv':
          await exportToCSV(data, `${filename}.csv`);
          break;
        case 'json':
          await exportToJSON(data, `${filename}.json`);
          break;
        case 'png':
          if (chartRef?.current) {
            await exportChartAsPNG(chartRef.current, `${filename}_chart.png`);
          } else if (svgRef?.current) {
            await exportD3AsPNG(svgRef.current, `${filename}_visualization.png`);
          }
          break;
        case 'svg':
          if (svgRef?.current) {
            await exportD3AsSVG(svgRef.current, `${filename}_visualization.svg`);
          }
          break;
        default:
          throw new Error(`Unknown export format: ${format}`);
      }
      setShowMenu(false);
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  const hasVisualization = chartRef?.current || svgRef?.current;
  const hasSVG = svgRef?.current;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: exporting ? 'wait' : 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>Export</span>
        <span style={{ fontSize: '12px' }}>▼</span>
      </button>

      {showMenu && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '4px',
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            minWidth: '160px',
            zIndex: 1000
          }}
        >
          <div style={{ padding: '4px 0' }}>
            <h4 style={{ 
              margin: '0', 
              padding: '8px 16px 4px', 
              fontSize: '12px', 
              color: '#666',
              borderBottom: '1px solid #eee'
            }}>
              Data Export
            </h4>
            
            <button
              onClick={() => handleExport('csv')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📄 Export as CSV
            </button>
            
            <button
              onClick={() => handleExport('json')}
              style={{
                display: 'block',
                width: '100%',
                padding: '8px 16px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '14px'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              📋 Export as JSON
            </button>

            {hasVisualization && (
              <>
                <h4 style={{ 
                  margin: '0', 
                  padding: '8px 16px 4px', 
                  fontSize: '12px', 
                  color: '#666',
                  borderTop: '1px solid #eee',
                  borderBottom: '1px solid #eee'
                }}>
                  Chart Export
                </h4>
                
                <button
                  onClick={() => handleExport('png')}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px 16px',
                    border: 'none',
                    background: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  🖼️ Export as PNG
                </button>

                {hasSVG && (
                  <button
                    onClick={() => handleExport('svg')}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 16px',
                      border: 'none',
                      background: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    🎨 Export as SVG
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}

export default function ExportOptions(props) {
  return (
    <ErrorBoundary
      title="Export Options Error"
      message="There was a problem with the export functionality."
    >
      <ExportOptionsContent {...props} />
    </ErrorBoundary>
  );
} 