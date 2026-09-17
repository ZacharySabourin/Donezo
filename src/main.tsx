import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Application entry point. Mounts `App` into the `#root` element
 * declared in `index.html`, wrapped in `StrictMode`.
 */
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Failed to find the root element");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
