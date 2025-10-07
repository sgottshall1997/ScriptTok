import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
}

console.log("🔐 Clerk Configuration:");
console.log("  - Publishable Key exists:", !!publishableKey);
console.log("  - Key starts with:", publishableKey?.substring(0, 7));
console.log("  - Environment:", import.meta.env.MODE);

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={publishableKey}
  >
    <App />
  </ClerkProvider>
);
