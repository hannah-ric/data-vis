import { createBarChart } from './barChart.js';
import { createLineChart } from './lineChart.js';
import { createScatterChart } from './scatterChart.js';

import barData from '../data/bar-data.json' assert { type: 'json' };
import lineData from '../data/line-data.json' assert { type: 'json' };
import scatterData from '../data/scatter-data.json' assert { type: 'json' };

document.addEventListener('DOMContentLoaded', () => {
  createBarChart('#bar-chart', barData);
  createLineChart('#line-chart', lineData);
  createScatterChart('#scatter-chart', scatterData);
});

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