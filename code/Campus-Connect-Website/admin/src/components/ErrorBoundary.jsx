import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Application render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 p-6 text-center text-slate-700"
          role="alert"
        >
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p>Refresh the page to try again.</p>
          <button
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
