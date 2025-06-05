import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // TODO: Implement actual error logging service
    // For now, we'll store in localStorage for debugging
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error.toString(),
      componentStack: errorInfo.componentStack,
      stack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      // Keep only last 50 errors
      if (existingLogs.length > 50) {
        existingLogs.shift();
      }
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback, showDetails = true } = this.props;

      if (fallback) {
        return fallback(this.state.error, this.handleReset);
      }

      return (
        <div style={{
          padding: '20px',
          margin: '20px',
          border: '2px solid #ff6b6b',
          borderRadius: '8px',
          backgroundColor: '#ffe0e0',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h2 style={{ color: '#c92a2a', marginTop: 0 }}>
            {this.props.title || 'Something went wrong'}
          </h2>
          
          <p style={{ color: '#495057' }}>
            {this.props.message || 'An unexpected error occurred. Please try refreshing the page.'}
          </p>

          {showDetails && this.state.error && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', color: '#495057' }}>
                Error details (for developers)
              </summary>
              <pre style={{
                marginTop: '10px',
                padding: '10px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            style={{
              marginTop: '15px',
              padding: '8px 16px',
              backgroundColor: '#087f5b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Try Again
          </button>

          {this.state.errorCount > 2 && (
            <p style={{ 
              marginTop: '10px', 
              fontSize: '12px', 
              color: '#868e96' 
            }}>
              Multiple errors detected. Consider reloading the page.
            </p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 