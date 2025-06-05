import { useCallback } from 'react';

export const useErrorHandler = () => {
  const logError = useCallback((error, context = {}) => {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      message: error.message || error.toString(),
      stack: error.stack,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorInfo);
    }

    // Store in localStorage
    try {
      const errors = JSON.parse(localStorage.getItem('appErrors') || '[]');
      errors.push(errorInfo);
      // Keep only last 100 errors
      if (errors.length > 100) {
        errors.splice(0, errors.length - 100);
      }
      localStorage.setItem('appErrors', JSON.stringify(errors));
    } catch (e) {
      console.error('Failed to store error:', e);
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement actual error tracking service integration
      // Example: Sentry, LogRocket, etc.
    }
  }, []);

  const clearErrors = useCallback(() => {
    localStorage.removeItem('appErrors');
  }, []);

  const getErrors = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem('appErrors') || '[]');
    } catch {
      return [];
    }
  }, []);

  return { logError, clearErrors, getErrors };
};

export default useErrorHandler; 