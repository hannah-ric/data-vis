import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

export function setupWebSocketHandlers(wss, rSessionManager) {
  wss.on('connection', (ws) => {
    const clientId = uuidv4();
    const sessionId = uuidv4();
    
    logger.info(`WebSocket client connected: ${clientId}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      clientId,
      sessionId,
      timestamp: new Date().toISOString()
    }));

    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'execute_code':
            await handleExecuteCode(ws, sessionId, data, rSessionManager);
            break;
            
          case 'execute_prompt':
            await handleExecutePrompt(ws, sessionId, data, rSessionManager);
            break;
            
          case 'cancel_execution':
            await handleCancelExecution(ws, sessionId, rSessionManager);
            break;
            
          case 'get_session_stats':
            await handleGetSessionStats(ws, rSessionManager);
            break;
            
          case 'ping':
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
            break;
            
          default:
            ws.send(JSON.stringify({
              type: 'error',
              error: `Unknown message type: ${data.type}`
            }));
        }
      } catch (error) {
        logger.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          error: error.message
        }));
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      logger.info(`WebSocket client disconnected: ${clientId}`);
      // Session cleanup is handled by the session manager's timeout
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error(`WebSocket error for client ${clientId}:`, error);
    });
  });
}

async function handleExecuteCode(ws, sessionId, data, rSessionManager) {
  const { code, data: userData, requestId } = data;
  
  // Send execution started message
  ws.send(JSON.stringify({
    type: 'execution_started',
    requestId,
    timestamp: new Date().toISOString()
  }));

  try {
    // Prepare data if provided
    let fullCode = code;
    if (userData) {
      const dataLoadCode = rSessionManager.validator.generateSafeDataLoad(userData);
      fullCode = `${dataLoadCode}\n\n${code}`;
    }

    // Execute code
    const result = await rSessionManager.executeCode(sessionId, fullCode, {
      timeout: data.timeout || 30000
    });

    // Send result
    ws.send(JSON.stringify({
      type: 'execution_complete',
      requestId,
      result,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'execution_error',
      requestId,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function handleExecutePrompt(ws, sessionId, data, rSessionManager) {
  const { prompt, data: userData, requestId } = data;
  
  // Send execution started message
  ws.send(JSON.stringify({
    type: 'prompt_started',
    requestId,
    timestamp: new Date().toISOString()
  }));

  try {
    // Generate and execute R code from prompt
    const result = await rSessionManager.executePrompt(sessionId, prompt, userData, {
      timeout: data.timeout || 30000
    });

    // Send result
    ws.send(JSON.stringify({
      type: 'prompt_complete',
      requestId,
      result,
      generatedCode: result.code, // Include generated code for transparency
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'prompt_error',
      requestId,
      error: error.message,
      timestamp: new Date().toISOString()
    }));
  }
}

async function handleCancelExecution(ws, sessionId, rSessionManager) {
  try {
    const session = rSessionManager.sessions.get(sessionId);
    if (session) {
      await session.terminate();
      ws.send(JSON.stringify({
        type: 'execution_cancelled',
        timestamp: new Date().toISOString()
      }));
    }
  } catch (error) {
    ws.send(JSON.stringify({
      type: 'error',
      error: `Failed to cancel execution: ${error.message}`
    }));
  }
}

async function handleGetSessionStats(ws, rSessionManager) {
  const stats = {
    activeSessions: rSessionManager.getActiveSessionCount(),
    sessions: rSessionManager.getSessionStats(),
    rAvailable: rSessionManager.isRAvailable()
  };

  ws.send(JSON.stringify({
    type: 'session_stats',
    stats,
    timestamp: new Date().toISOString()
  }));
} 