import React, { useEffect, useRef, useState } from 'react';
import { Chart } from 'chart.js/auto';
import ErrorBoundary from './ErrorBoundary';
import ExportOptions from './ExportOptions';

function VisualizationContent({ data, config, datasetId }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [chartError, setChartError] = useState(null);

  useEffect(() => {
    if (!data || !config.x || !config.y) {
      setChartError('Please select both X and Y axes for visualization');
      return;
    }

    setChartError(null);

    try {
      const ctx = canvasRef.current.getContext('2d');
      
      // Destroy existing chart if any
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      // Prepare data
      const labels = data.map((row) => row[config.x]);
      const values = data.map((row) => {
        const value = row[config.y];
        return typeof value === 'number' ? value : parseFloat(value) || 0;
      });

      // Create new chart
      chartRef.current = new Chart(ctx, {
        type: config.type,
        data: {
          labels: labels,
          datasets: [
            {
              label: config.y,
              data: values,
              backgroundColor: config.type === 'bar' ? 'rgba(54, 162, 235, 0.5)' : 'rgba(75, 192, 192, 0.5)',
              borderColor: config.type === 'bar' ? 'rgba(54, 162, 235, 1)' : 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              tension: config.type === 'line' ? 0.1 : 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `${config.y} by ${config.x}`,
              font: {
                size: 16
              }
            },
            legend: {
              display: true,
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: config.x
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: config.y
              },
              beginAtZero: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Chart creation error:', error);
      setChartError(`Failed to create chart: ${error.message}`);
    }

    // Cleanup function
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, config]);

  if (chartError) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        color: '#856404',
        marginTop: '20px'
      }}>
        <strong>Visualization Error:</strong> {chartError}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginTop: '20px'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: 0 }}>Visualization</h3>
        <ExportOptions 
          data={data} 
          chartRef={chartRef}
          filename={`dataset_${datasetId}_${config.type}`}
        />
      </div>
      
      <div style={{ 
        position: 'relative', 
        height: '400px',
        width: '100%'
      }}>
        <canvas ref={canvasRef}></canvas>
      </div>
    </div>
  );
}

export default function Visualization(props) {
  return (
    <ErrorBoundary
      title="Visualization Error"
      message="There was a problem rendering the chart. Please check your data and configuration."
    >
      <VisualizationContent {...props} />
    </ErrorBoundary>
  );
}
