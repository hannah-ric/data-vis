import Papa from 'papaparse';

// Export data as CSV
export const exportToCSV = (data, filename = 'data.csv') => {
  try {
    const csv = Papa.unparse(data, {
      header: true,
      skipEmptyLines: true
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
    return true;
  } catch (error) {
    console.error('Error exporting to CSV:', error);
    throw new Error('Failed to export data as CSV');
  }
};

// Export data as JSON
export const exportToJSON = (data, filename = 'data.json') => {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, filename);
    return true;
  } catch (error) {
    console.error('Error exporting to JSON:', error);
    throw new Error('Failed to export data as JSON');
  }
};

// Export chart as PNG
export const exportChartAsPNG = (chartInstance, filename = 'chart.png') => {
  try {
    if (!chartInstance) {
      throw new Error('No chart instance provided');
    }

    // Get the canvas element
    const canvas = chartInstance.canvas;
    if (!canvas) {
      throw new Error('Chart canvas not found');
    }

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, filename);
      } else {
        throw new Error('Failed to create image blob');
      }
    }, 'image/png');
    
    return true;
  } catch (error) {
    console.error('Error exporting chart as PNG:', error);
    throw new Error('Failed to export chart as image');
  }
};

// Export D3 visualization as SVG
export const exportD3AsSVG = (svgElement, filename = 'visualization.svg') => {
  try {
    if (!svgElement) {
      throw new Error('No SVG element provided');
    }

    // Clone the SVG to avoid modifying the original
    const svgClone = svgElement.cloneNode(true);
    
    // Add necessary attributes
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
    
    // Convert to string
    const svgString = new XMLSerializer().serializeToString(svgClone);
    
    // Create blob and download
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    downloadBlob(blob, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting SVG:', error);
    throw new Error('Failed to export visualization as SVG');
  }
};

// Export D3 visualization as PNG
export const exportD3AsPNG = (svgElement, filename = 'visualization.png', scale = 2) => {
  try {
    if (!svgElement) {
      throw new Error('No SVG element provided');
    }

    // Get SVG dimensions
    const bbox = svgElement.getBoundingClientRect();
    const width = bbox.width * scale;
    const height = bbox.height * scale;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    // Convert SVG to data URL
    const svgClone = svgElement.cloneNode(true);
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    // Create image and draw to canvas
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(svgUrl);
      
      // Convert canvas to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, filename);
        }
      }, 'image/png');
    };
    
    img.src = svgUrl;
    return true;
  } catch (error) {
    console.error('Error exporting D3 as PNG:', error);
    throw new Error('Failed to export visualization as PNG');
  }
};

// Helper function to download blob
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export multiple formats at once
export const exportData = (data, format, filename) => {
  const baseFilename = filename || `data_${new Date().toISOString().slice(0, 10)}`;
  
  switch (format.toLowerCase()) {
    case 'csv':
      return exportToCSV(data, `${baseFilename}.csv`);
    case 'json':
      return exportToJSON(data, `${baseFilename}.json`);
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}; 