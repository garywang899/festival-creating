
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const cleanup = () => {
  const loading = document.getElementById('loading-indicator');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => { loading.style.display = 'none'; }, 500);
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
    cleanup();
  } catch (err) {
    console.error('Render failure:', err);
    cleanup(); // 即使失败也关闭加载动画，让用户能看到错误提示或尝试操作
  }
}
