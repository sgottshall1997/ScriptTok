import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  console.warn("Missing VITE_CLERK_PUBLISHABLE_KEY - Clerk disabled");
}

createRoot(document.getElementById("root")!).render(
  publishableKey ? (
    <ClerkProvider publishableKey={publishableKey}>
      <App />
    </ClerkProvider>
  ) : (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Clerk Configuration Required</h1>
      <p>Please set up VITE_CLERK_PUBLISHABLE_KEY in your environment variables.</p>
    </div>
  )
);
