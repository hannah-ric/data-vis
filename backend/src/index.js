import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateRequest } from './middleware/validation.js';
import rRoutes from './routes/r.routes.js';
import visualizationRoutes from './routes/visualization.routes.js';
import { RSessionManager } from './services/RSessionManager.js';
import { setupWebSocketHandlers } from './services/websocket.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize R session manager
const rSessionManager = new RSessionManager();

// Make rSessionManager available to routes
app.locals.rSessionManager = rSessionManager;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

const rLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit R executions to 10 per minute
  message: 'Too many R execution requests, please try again later.'
});

app.use('/api/', limiter);
app.use('/api/r/', rLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const rAvailable = sessionManager.isRAvailable();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rAvailable,
    version: '1.0.0'
  });
});

// Routes
app.use('/api/r', rRoutes);
app.use('/api/visualizations', visualizationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    rAvailable: rSessionManager.isRAvailable(),
    activeSessions: rSessionManager.getActiveSessionCount()
  });
});

// WebSocket setup
setupWebSocketHandlers(wss, rSessionManager);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`WebSocket server ready`);
  
  // Initialize R
  rSessionManager.initialize().then(() => {
    logger.info('R session manager initialized');
  }).catch(err => {
    logger.error('Failed to initialize R session manager:', err);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  
  server.close(() => {
    logger.info('HTTP server closed');
  });
  
  await rSessionManager.cleanup();
  process.exit(0);
});

export { app, wss, rSessionManager }; 