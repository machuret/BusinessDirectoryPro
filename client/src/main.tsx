import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress expected 401 authentication errors from console
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args.join(' ');
  // Skip 401 authentication errors as they're expected for unauthenticated users
  if (message.includes('401') && message.includes('/api/auth/user')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
