
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// 脚本一旦开始运行，立即隐藏加载器
const hideLoader = () => {
  const loading = document.getElementById('loading-indicator');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
    }, 500);
  }
};

const rootElement = document.getElementById('root');

if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    // 成功开始渲染后隐藏
    hideLoader();
    console.log('App successfully mounted.');
  } catch (err) {
    console.error('Render error:', err);
    hideLoader();
    const display = document.getElementById('error-display');
    if (display) {
      display.style.display = 'block';
      display.innerHTML = `<strong>渲染引擎初始化失败:</strong><br>${err instanceof Error ? err.message : String(err)}`;
    }
  }
} else {
  console.error('Critical: Root element not found.');
}
