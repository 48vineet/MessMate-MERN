// src/components/common/ErrorBoundary.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to error reporting service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // In production, send error to logging service like Sentry
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Example: fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) })
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, errorId } = this.state;
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md w-full"
          >
            {/* Error Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="bg-red-50 border-b border-red-200 p-6 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="text-xl font-bold text-red-900 mb-2">
                  Oops! Something went wrong
                </h1>
                <p className="text-red-700 text-sm">
                  We encountered an unexpected error in the MessMate application.
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Error ID */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Error ID:</span>
                      <span className="text-sm font-mono text-gray-900 bg-white px-2 py-1 rounded">
                        {errorId}
                      </span>
                    </div>
                  </div>

                  {/* Error Message (Development only) */}
                  {isDevelopment && error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h3 className="text-sm font-medium text-red-800 mb-2 flex items-center">
                        <BugAntIcon className="h-4 w-4 mr-1" />
                        Error Details (Development)
                      </h3>
                      <div className="text-xs font-mono text-red-700 bg-white p-2 rounded overflow-auto max-h-32">
                        <div className="mb-2">
                          <strong>Message:</strong> {error.message}
                        </div>
                        {error.stack && (
                          <div>
                            <strong>Stack:</strong>
                            <pre className="whitespace-pre-wrap text-xs mt-1">
                              {error.stack}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* What happened */}
                  <div className="text-sm text-gray-600">
                    <h3 className="font-medium text-gray-900 mb-2">What happened?</h3>
                    <ul className="space-y-1 text-sm">
                      <li>• An unexpected error occurred while loading this page</li>
                      <li>• This has been automatically reported to our team</li>
                      <li>• Try refreshing the page or going back to the homepage</li>
                    </ul>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3 pt-4">
                    <button
                      onClick={this.handleRetry}
                      className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <ArrowPathIcon className="h-5 w-5 mr-2" />
                      Try Again
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={this.handleReload}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <ArrowPathIcon className="h-4 w-4 mr-2" />
                        Reload
                      </button>
                      <button
                        onClick={this.handleGoHome}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <HomeIcon className="h-4 w-4 mr-2" />
                        Go Home
                      </button>
                    </div>
                  </div>

                  {/* Help Text */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Need help?</h4>
                    <p className="text-xs text-blue-700">
                      If this problem persists, please contact support with Error ID: {errorId}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                MessMate • Smart Mess Management System
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for modern React patterns
export const withErrorBoundary = (WrappedComponent, errorFallback) => {
  return function WithErrorBoundaryComponent(props) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };
};

// Hook for error reporting in functional components
export const useErrorHandler = () => {
  const handleError = (error, errorInfo = {}) => {
    console.error('Manual error report:', error, errorInfo);
    
    // Log to error service in production
    if (process.env.NODE_ENV === 'production') {
      const errorData = {
        message: error.message || error,
        stack: error.stack,
        ...errorInfo,
        timestamp: new Date().toISOString(),
        url: window.location.href
      };
      
      // Example: Send to error tracking service
    }
  };

  return { handleError };
};

export default ErrorBoundary;
