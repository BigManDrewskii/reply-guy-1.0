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
}

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[400px] px-4">
          <div className="text-center space-y-4 max-w-md">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center">
                <AlertCircle size={24} className="text-destructive" />
              </div>
            </div>

            <div>
              <h2 className="text-base font-semibold text-foreground mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground">
                An unexpected error occurred. You can try refreshing or restarting the extension.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-muted-foreground">
                  Error details
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs text-muted-foreground overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            <div className="flex gap-2 justify-center">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-cta text-cta-foreground rounded-lg text-sm font-semibold hover:bg-cta-hover active:bg-cta-active transition-colors flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-muted text-foreground border border-border rounded-lg text-sm font-semibold hover:bg-card-hover active:bg-accent transition-colors"
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
