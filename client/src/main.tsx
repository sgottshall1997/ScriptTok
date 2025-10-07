import { createRoot } from "react-dom/client";
import { AuthProvider } from "@/components/AuthProvider";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);
