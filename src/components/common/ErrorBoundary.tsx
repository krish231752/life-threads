import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          aria-live="assertive"
          className="mx-auto max-w-xl my-8 rounded-3xl border border-red-500/30 bg-[#120B0E] p-6 sm:p-8 text-center space-y-4 shadow-2xl"
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white">
              {this.props.fallbackTitle || 'Something went wrong while rendering this visualization'}
            </h3>
            <p className="text-xs text-white/60 font-light max-w-md mx-auto">
              An unexpected display anomaly occurred. You can retry rendering or reset to the default master dataset.
            </p>
          </div>

          {this.state.error && (
            <div className="rounded-xl bg-black/40 border border-white/[0.06] p-3 text-left">
              <p className="font-mono text-[11px] text-red-300 truncate">
                {this.state.error.message || 'Unknown render error'}
              </p>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={this.handleRetry}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black px-4 py-2 text-xs font-bold transition focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Visualization</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
