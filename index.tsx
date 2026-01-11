
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 标记应用已成功进入逻辑执行阶段
(window as any).APP_STARTED = true;

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App Core initialized");
  } catch (err) {
    console.error("Render Error:", err);
    document.body.innerHTML += `<div style="position:fixed; bottom:20px; left:20px; color:red; font-size:12px; z-index:10001;">渲染失败: ${err}</div>`;
  }
}
