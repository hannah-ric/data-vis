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

