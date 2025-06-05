import { useState, useEffect, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const useRVisualization = () => {
  const [connected, setConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const requestQueueRef = useRef([]);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      wsRef.current = new WebSocket(WS_URL);

      wsRef.current.onopen = () => {
        console.log('Connected to R backend');
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        
        // Process queued requests
        while (requestQueueRef.current.length > 0) {
          const request = requestQueueRef.current.shift();
          wsRef.current.send(JSON.stringify(request));
        }
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from R backend');
        setConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect
        if (reconnectAttemptsRef.current < 5) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('Connection error. Please check if the backend is running.');
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError('Failed to connect to R backend');
    }
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message) => {
    switch (message.type) {
      case 'connected':
        setSessionId(message.sessionId);
        break;
        
      case 'execution_started':
      case 'prompt_started':
        setExecuting(true);
        setError(null);
        break;
        
      case 'execution_complete':
      case 'prompt_complete':
        setExecuting(false);
        setResults(prev => [...prev, {
          id: message.requestId,
          type: 'success',
          result: message.result,
          code: message.generatedCode,
          timestamp: message.timestamp
        }]);
        break;
        
      case 'execution_error':
      case 'prompt_error':
        setExecuting(false);
        setError(message.error);
        setResults(prev => [...prev, {
          id: message.requestId,
          type: 'error',
          error: message.error,
          timestamp: message.timestamp
        }]);
        break;
        
      case 'error':
        setError(message.error);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  }, []);

  // Execute R code
  const executeCode = useCallback((code, data = null, options = {}) => {
    const requestId = uuidv4();
    const request = {
      type: 'execute_code',
      requestId,
      code,
      data,
      ...options
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(request));
    } else {
      requestQueueRef.current.push(request);
      connect();
    }

    return requestId;
  }, [connect]);

  // Execute prompt
  const executePrompt = useCallback((prompt, data, options = {}) => {
    const requestId = uuidv4();
    const request = {
      type: 'execute_prompt',
      requestId,
      prompt,
      data,
      ...options
    };

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(request));
    } else {
      requestQueueRef.current.push(request);
      connect();
    }

    return requestId;
  }, [connect]);

  // Cancel execution
  const cancelExecution = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'cancel_execution' }));
    }
  }, []);

  // Get R templates
  const getTemplates = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/r/templates`);
      if (!response.ok) throw new Error('Failed to fetch templates');
      return await response.json();
    } catch (err) {
      console.error('Failed to get templates:', err);
      throw err;
    }
  }, []);

  // Get visualization suggestions
  const getSuggestions = useCallback(async (data) => {
    try {
      const response = await fetch(`${API_URL}/visualizations/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data })
      });
      if (!response.ok) throw new Error('Failed to get suggestions');
      return await response.json();
    } catch (err) {
      console.error('Failed to get suggestions:', err);
      throw err;
    }
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  // Connect on mount
  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    connected,
    sessionId,
    executing,
    results,
    error,
    executeCode,
    executePrompt,
    cancelExecution,
    getTemplates,
    getSuggestions,
    clearResults
  };
};

export default useRVisualization; 