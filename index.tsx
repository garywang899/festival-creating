
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log('App initialization started...');

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App render initiated successfully');
  } catch (err) {
    console.error('Failed to render React app:', err);
    const display = document.getElementById('error-display');
    if (display) {
      display.style.display = 'block';
      display.innerHTML = `<strong>React 挂载失败:</strong><br>${err instanceof Error ? err.message : String(err)}`;
    }
  }
} else {
  console.error('Failed to find root element');
}
