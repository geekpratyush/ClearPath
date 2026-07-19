import React from 'react';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode, name: string },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error in " + this.props.name, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-900 text-red-100 rounded-lg m-4 h-full overflow-auto">
          <h2 className="text-xl font-bold mb-2">Crash in {this.props.name}</h2>
          <pre className="text-sm whitespace-pre-wrap font-mono mb-4">{this.state.error?.toString()}</pre>
          <pre className="text-xs whitespace-pre-wrap font-mono opacity-80">{this.state.errorInfo?.componentStack}</pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
          >
            Try to recover
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
