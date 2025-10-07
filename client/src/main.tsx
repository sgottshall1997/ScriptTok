import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

console.log("🚀 Starting ScriptTok application (Auth temporarily disabled)");
console.log("  - Environment:", import.meta.env.MODE);

createRoot(document.getElementById("root")!).render(<App />);
