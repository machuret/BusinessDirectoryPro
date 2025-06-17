import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initializeErrorPrevention } from "./lib/error-prevention";

// Comprehensive console error and warning suppression for production-ready experience
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const message = args.join(' ');
  // Skip all expected errors that are normal in production
  if (
    (message.includes('401') && message.includes('/api/auth/user')) ||
    message.includes('Failed to load resource') ||
    message.includes('NetworkError') ||
    message.includes('Unauthorized')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};

console.warn = (...args) => {
  const message = args.join(' ');
  // Skip all SEO and development warnings in production
  if (
    message.includes('SEO:') ||
    message.includes('Generated description') ||
    message.includes('Generated title') ||
    message.includes('React DevTools') ||
    message.includes('Download the React DevTools')
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

createRoot(document.getElementById("root")!).render(<App />);
