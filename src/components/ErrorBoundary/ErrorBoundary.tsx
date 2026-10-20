import { Component, ErrorInfo, ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

// Keeps a crash in one page from blanking the whole app.
class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center space-y-4">
          <h1 className="text-xl font-semibold text-white">Diçka shkoi keq</h1>
          <p className="text-sm text-neutral-400">
            Faqja hasi një gabim. Të dhënat e ruajtura nuk janë prekur.
          </p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold"
            >
              Rifresko faqen
            </button>
            <button
              type="button"
              onClick={() => window.location.assign("/")}
              className="rounded-xl border border-neutral-700 px-4 py-2 text-sm text-white"
            >
              Kthehu në fillim
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
