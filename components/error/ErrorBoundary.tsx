import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from '@/lib/icons';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  retryCount: number;
}

const MAX_RETRIES = 3;

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 * Includes retry mechanism with max retry limit.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState((prev) => ({
        hasError: false,
        error: null,
        retryCount: prev.retryCount + 1,
      }));
    }
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < MAX_RETRIES;

      return (
        <div className="flex items-center justify-center min-h-[400px] px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-destructive-subtle flex items-center justify-center">
                <AlertCircle size={24} className="text-destructive" />
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">
                {canRetry
                  ? 'An unexpected error occurred. You can try again.'
                  : 'This error persists after multiple retries. Please reload the extension.'}
              </p>
              {this.state.retryCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Retry {this.state.retryCount}/{MAX_RETRIES}
                </p>
              )}
            </div>

            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground/70">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs text-muted-foreground overflow-auto max-h-32 font-mono">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-2 justify-center">
              {canRetry && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-semibold hover:opacity-90 active:opacity-80 transition-opacity flex items-center gap-2"
                >
                  <RefreshCw size={14} />
                  Try Again
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-muted text-foreground border border-border rounded-lg text-sm font-semibold hover:bg-muted-hover active:bg-accent transition-colors"
              >
                Reload Extension
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
