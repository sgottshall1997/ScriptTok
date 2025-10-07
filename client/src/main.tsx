import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { Component, ReactNode } from "react";
import App from "./App";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

class ClerkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.warn("⚠️ Clerk initialization failed - running without authentication:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.children;
    }
    return this.props.children;
  }
}

window.addEventListener('error', (event) => {
  if (event.message?.includes('ClerkJS') || event.message?.includes('Clerk')) {
    console.warn("⚠️ Clerk error caught - app will continue without authentication");
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('ClerkJS') || event.reason?.message?.includes('Clerk')) {
    console.warn("⚠️ Clerk promise rejection caught - app will continue without authentication");
    event.preventDefault();
  }
});

console.log("🔐 Clerk Configuration:");
console.log("  - Publishable Key exists:", !!publishableKey);
console.log("  - Key starts with:", publishableKey?.substring(0, 7));
console.log("  - Environment:", import.meta.env.MODE);

const root = createRoot(document.getElementById("root")!);

if (!publishableKey) {
  console.warn("⚠️ Missing VITE_CLERK_PUBLISHABLE_KEY - running without authentication");
  root.render(<App />);
} else {
  root.render(
    <ClerkErrorBoundary>
      <ClerkProvider 
        publishableKey={publishableKey}
      >
        <App />
      </ClerkProvider>
    </ClerkErrorBoundary>
  );
}
