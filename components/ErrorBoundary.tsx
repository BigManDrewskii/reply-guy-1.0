// React Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    // Log error details for debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };

    // In production, this could be sent to error tracking service
    console.error('[ErrorBoundary] Error details:', JSON.stringify(errorDetails, null, 2));
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-[380px] h-screen bg-black text-[#ededed] flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            {/* Error Icon */}
            <div className="text-4xl">⚠️</div>

            {/* Error Message */}
            <h2 className="text-lg font-semibold text-[#ededed]">Something went wrong</h2>

            <p className="text-sm text-[#a1a1a1]">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>

            {/* Reset Button */}
            <button
              onClick={this.handleReset}
              className="mt-4 px-4 py-2 bg-[#0070f3] text-white rounded hover:bg-[#0060df] transition-colors"
            >
              Try Again
            </button>

            {/* Debug Info (development) */}
            {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
              <details className="mt-4 text-left">
                <summary className="text-xs text-[#666] cursor-pointer hover:text-[#a1a1a1]">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-[#666] bg-[#111] p-2 rounded overflow-auto max-h-40">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
