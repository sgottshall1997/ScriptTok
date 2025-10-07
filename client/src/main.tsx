import { createRoot } from "react-dom/client";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";

console.log("🚀 Starting ScriptTok application with Supabase Auth");
console.log("  - Environment:", import.meta.env.MODE);

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <App />
    </SupabaseAuthProvider>
  </QueryClientProvider>
);
