import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
// Suppress all console output in production
if (import.meta.env.MODE === "production") {
  ["log", "error", "warn", "info", "debug"].forEach((m) => {
    console[m] = () => {};
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
