import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Global error handler to help catch initialization crashes
window.onerror = (message, _source, _lineno, _colno, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="padding: 20px; color: red; background: #fff; border: 2px solid red;">
        <h1>Application Error</h1>
        <p>${message}</p>
        <pre>${error?.stack || ''}</pre>
        <button onclick="location.reload()">Reload Page</button>
      </div>
    `;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Root element not found!");
} else {
  console.log("Rendering app...");
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
