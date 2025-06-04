import { registerShortcuts } from './shortcuts.js';

function filterData() {
  console.log('Filtering data...');
}

function resizeVisualization() {
  console.log('Resizing visualization...');
}

function exportData() {
  console.log('Exporting data...');
}

registerShortcuts({
  onFilter: filterData,
  onResize: resizeVisualization,
  onExport: exportData
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);