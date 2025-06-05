import express from 'express';
import { validateRequest, schemas } from '../middleware/validation.js';

const router = express.Router();

// Create visualization from config
router.post('/create', validateRequest(schemas.createVisualization), async (req, res, next) => {
  try {
    const { type, data, config } = req.body;
    
    // Generate R code based on visualization type
    let rCode = '';
    
    switch (type) {
      case 'ggplot':
        rCode = generateGgplotCode(config, data);
        break;
      case 'plotly':
        rCode = generatePlotlyCode(config, data);
        break;
      case 'base':
        rCode = generateBaseRCode(config, data);
        break;
      default:
        throw new Error(`Unsupported visualization type: ${type}`);
    }
    
    res.json({
      success: true,
      code: rCode,
      type
    });
  } catch (error) {
    next(error);
  }
});

// Get visualization suggestions based on data
router.post('/suggest', async (req, res, next) => {
  try {
    const { data } = req.body;
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        error: 'Invalid data provided'
      });
    }
    
    // Analyze data structure
    const columns = Object.keys(data[0]);
    const dataTypes = {};
    
    columns.forEach(col => {
      const sample = data[0][col];
      if (typeof sample === 'number') {
        dataTypes[col] = 'numeric';
      } else if (typeof sample === 'string') {
        // Check if it's a date
        if (!isNaN(Date.parse(sample))) {
          dataTypes[col] = 'date';
        } else {
          dataTypes[col] = 'categorical';
        }
      } else {
        dataTypes[col] = 'unknown';
      }
    });
    
    // Generate suggestions
    const suggestions = [];
    
    // Count numeric columns
    const numericColumns = Object.entries(dataTypes)
      .filter(([_, type]) => type === 'numeric')
      .map(([col, _]) => col);
    
    const categoricalColumns = Object.entries(dataTypes)
      .filter(([_, type]) => type === 'categorical')
      .map(([col, _]) => col);
    
    const dateColumns = Object.entries(dataTypes)
      .filter(([_, type]) => type === 'date')
      .map(([col, _]) => col);
    
    // Correlation matrix for multiple numeric columns
    if (numericColumns.length >= 2) {
      suggestions.push({
        type: 'correlation',
        title: 'Correlation Matrix',
        description: 'Visualize relationships between numeric variables',
        requiredColumns: numericColumns
      });
    }
    
    // Scatter plots for pairs of numeric columns
    if (numericColumns.length >= 2) {
      for (let i = 0; i < Math.min(numericColumns.length - 1, 3); i++) {
        for (let j = i + 1; j < Math.min(numericColumns.length, 4); j++) {
          suggestions.push({
            type: 'scatter',
            title: `Scatter: ${numericColumns[i]} vs ${numericColumns[j]}`,
            description: 'Explore relationship between two variables',
            config: {
              x: numericColumns[i],
              y: numericColumns[j]
            }
          });
        }
      }
    }
    
    // Histograms for numeric columns
    numericColumns.slice(0, 3).forEach(col => {
      suggestions.push({
        type: 'histogram',
        title: `Distribution of ${col}`,
        description: 'Visualize the distribution of values',
        config: {
          variable: col
        }
      });
    });
    
    // Box plots for numeric vs categorical
    if (numericColumns.length > 0 && categoricalColumns.length > 0) {
      suggestions.push({
        type: 'boxplot',
        title: `${numericColumns[0]} by ${categoricalColumns[0]}`,
        description: 'Compare distributions across categories',
        config: {
          x: categoricalColumns[0],
          y: numericColumns[0]
        }
      });
    }
    
    // Time series if date column exists
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      suggestions.push({
        type: 'timeseries',
        title: `Time Series: ${numericColumns[0]} over time`,
        description: 'Visualize trends over time',
        config: {
          x: dateColumns[0],
          y: numericColumns[0]
        }
      });
    }
    
    res.json({
      dataTypes,
      suggestions: suggestions.slice(0, 10) // Limit to 10 suggestions
    });
  } catch (error) {
    next(error);
  }
});

// Helper functions
function generateGgplotCode(config, data) {
  const { chartType, x, y, color, facet } = config;
  
  let code = 'library(ggplot2)\n\n';
  code += `ggplot(data, aes(x = ${x}`;
  
  if (y) code += `, y = ${y}`;
  if (color) code += `, color = ${color}`;
  
  code += ')) +\n';
  
  switch (chartType) {
    case 'scatter':
      code += '  geom_point(alpha = 0.7) +\n';
      break;
    case 'line':
      code += '  geom_line() +\n';
      break;
    case 'bar':
      code += '  geom_bar(stat = "identity") +\n';
      break;
    case 'histogram':
      code += '  geom_histogram(bins = 30) +\n';
      break;
    case 'boxplot':
      code += '  geom_boxplot() +\n';
      break;
    default:
      code += '  geom_point() +\n';
  }
  
  if (facet) {
    code += `  facet_wrap(~ ${facet}) +\n`;
  }
  
  code += '  theme_minimal() +\n';
  code += `  labs(title = "${config.title || 'Visualization'}")`;
  
  return code;
}

function generatePlotlyCode(config, data) {
  const { chartType, x, y, z } = config;
  
  let code = 'library(plotly)\n\n';
  
  switch (chartType) {
    case 'scatter':
      code += `plot_ly(data, x = ~${x}, y = ~${y}, type = 'scatter', mode = 'markers')`;
      break;
    case 'line':
      code += `plot_ly(data, x = ~${x}, y = ~${y}, type = 'scatter', mode = 'lines')`;
      break;
    case 'bar':
      code += `plot_ly(data, x = ~${x}, y = ~${y}, type = 'bar')`;
      break;
    case '3d':
      code += `plot_ly(data, x = ~${x}, y = ~${y}, z = ~${z}, type = 'scatter3d', mode = 'markers')`;
      break;
    default:
      code += `plot_ly(data, x = ~${x}, y = ~${y})`;
  }
  
  code += ` %>%\n  layout(title = "${config.title || 'Interactive Visualization'}")`;
  
  return code;
}

function generateBaseRCode(config, data) {
  const { chartType, x, y } = config;
  
  let code = '';
  
  switch (chartType) {
    case 'scatter':
      code = `plot(data$${x}, data$${y}, main = "${config.title || 'Scatter Plot'}", xlab = "${x}", ylab = "${y}")`;
      break;
    case 'histogram':
      code = `hist(data$${x}, main = "${config.title || 'Histogram'}", xlab = "${x}")`;
      break;
    case 'boxplot':
      code = `boxplot(data$${y} ~ data$${x}, main = "${config.title || 'Box Plot'}", xlab = "${x}", ylab = "${y}")`;
      break;
    default:
      code = `plot(data$${x}, data$${y})`;
  }
  
  return code;
}

export default router; 