import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-primary)',
          padding: 'var(--space-6)',
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '400px',
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius)',
              background: 'var(--danger-muted)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              margin: '0 auto var(--space-6)', color: 'var(--danger)',
            }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Something went wrong</h2>
            <p style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-6)', fontSize: 'var(--text-base)' }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
