
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 标记系统已成功接管
(window as any).APP_STARTED = true;

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
