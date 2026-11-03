import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-pink-100 text-[#FF64B4] flex items-center justify-center mb-4 text-2xl font-bold shadow-sm">
            !
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            Something unexpected occurred
          </h2>
          <p className="text-sm text-gray-600 max-w-md mb-6">
            We encountered a temporary rendering issue. Please click below to reload the home page smoothly.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 bg-[#FF64B4] hover:bg-[#e0529f] text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
            >
              Back to Home
            </button>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-5 py-2.5 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
