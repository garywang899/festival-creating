
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React App mounted successfully");
  } catch (err) {
    console.error("Failed to mount React app:", err);
    rootElement.innerHTML = `<div style="padding:20px; color:red;">应用启动失败，请检查网络或刷新页面。<br/>${err}</div>`;
  }
}
