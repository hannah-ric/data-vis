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
