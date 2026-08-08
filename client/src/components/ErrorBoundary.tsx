import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Catches render-time errors anywhere in the tree and shows a fallback
 * instead of leaving a blank screen. Without this, a single thrown
 * `.map` on undefined (e.g. while data is loading) unmounts the whole
 * app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="card p-8 max-w-md text-center">
            <h1 className="font-display text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-4">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              className="btn-gold"
              onClick={() => {
                this.setState({ hasError: false, error: undefined });
                window.location.reload();
              }}
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
