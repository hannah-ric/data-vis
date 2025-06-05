import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { validateRequest, schemas } from '../middleware/validation.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Execute R code
router.post('/execute', validateRequest(schemas.executeCode), async (req, res, next) => {
  try {
    const { code, data, timeout } = req.body;
    const sessionId = req.headers['x-session-id'] || uuidv4();
    
    // Get R session manager from app
    const rSessionManager = req.app.locals.rSessionManager;
    
    // Execute code
    const result = await rSessionManager.executeCode(sessionId, code, {
      data,
      timeout
    });
    
    res.json({
      success: true,
      sessionId,
      result
    });
  } catch (error) {
    next(error);
  }
});

// Execute R code from prompt
router.post('/prompt', validateRequest(schemas.executePrompt), async (req, res, next) => {
  try {
    const { prompt, data, timeout } = req.body;
    const sessionId = req.headers['x-session-id'] || uuidv4();
    
    // Get R session manager from app
    const rSessionManager = req.app.locals.rSessionManager;
    
    // Execute prompt
    const result = await rSessionManager.executePrompt(sessionId, prompt, data, {
      timeout
    });
    
    res.json({
      success: true,
      sessionId,
      result
    });
  } catch (error) {
    next(error);
  }
});

// Get available R packages
router.get('/packages', (req, res) => {
  const packages = [
    { name: 'ggplot2', description: 'Create elegant data visualizations' },
    { name: 'dplyr', description: 'Data manipulation' },
    { name: 'corrplot', description: 'Correlation matrices' },
    { name: 'plotly', description: 'Interactive visualizations' },
    { name: 'forecast', description: 'Time series forecasting' },
    { name: 'cluster', description: 'Clustering algorithms' },
    { name: 'randomForest', description: 'Random forest models' }
  ];
  
  res.json({ packages });
});

// Get R code templates
router.get('/templates', (req, res) => {
  const templates = {
    correlation: {
      name: 'Correlation Matrix',
      description: 'Create a correlation matrix visualization',
      code: `# Correlation matrix
library(corrplot)
cor_matrix <- cor(select_if(data, is.numeric))
corrplot(cor_matrix, method = "circle", type = "upper", 
         order = "hclust", tl.cex = 0.8, tl.col = "black")`
    },
    scatter: {
      name: 'Scatter Plot',
      description: 'Create a scatter plot with trend line',
      code: `# Scatter plot with trend line
library(ggplot2)
ggplot(data, aes(x = {x_var}, y = {y_var})) +
  geom_point(alpha = 0.6) +
  geom_smooth(method = "lm", se = TRUE) +
  theme_minimal() +
  labs(title = "Scatter Plot with Trend Line")`
    },
    distribution: {
      name: 'Distribution Plot',
      description: 'Visualize data distribution',
      code: `# Distribution plot
library(ggplot2)
ggplot(data, aes(x = {variable})) +
  geom_histogram(aes(y = ..density..), bins = 30, fill = "skyblue", alpha = 0.7) +
  geom_density(color = "red", size = 1) +
  theme_minimal() +
  labs(title = "Distribution of {variable}")`
    },
    timeseries: {
      name: 'Time Series',
      description: 'Time series visualization and decomposition',
      code: `# Time series analysis
library(forecast)
ts_data <- ts(data${variable}, frequency = 12)
plot(ts_data, main = "Time Series Plot")
decomposed <- decompose(ts_data)
plot(decomposed)`
    }
  };
  
  res.json({ templates });
});

// Get session information
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const rSessionManager = req.app.locals.rSessionManager;
    
    const session = rSessionManager.sessions.get(sessionId);
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    res.json({
      sessionId,
      stats: session.getStats()
    });
  } catch (error) {
    next(error);
  }
});

export default router; 