import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 记录日志，确认脚本已开始执行
console.log("Index.tsx is executing...");

const container = document.getElementById('root');
if (container) {
  try {
    // 只要脚本执行到这一步，就说明模块加载正常，立即设置标志位
    (window as any).APP_STARTED = true;
    
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("React app rendering initiated");
  } catch (e) {
    console.error("React mount failure:", e);
  }
}