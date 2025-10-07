import { createRoot } from "react-dom/client";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import App from "./App";
import "./index.css";

console.log("🚀 Starting ScriptTok application with Supabase Auth");
console.log("  - Environment:", import.meta.env.MODE);

createRoot(document.getElementById("root")!).render(
  <SupabaseAuthProvider>
    <App />
  </SupabaseAuthProvider>
);
