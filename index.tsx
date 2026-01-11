
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

/**
 * 只要 index.tsx 开始执行，说明核心模块已经下发
 * 我们第一时间清理 HTML 层留下的加载指示器和错误提示
 */
const fastCleanup = () => {
  const loading = document.getElementById('loading-indicator');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => { loading.style.display = 'none'; }, 500);
  }
  const errorDisplay = document.getElementById('error-display');
  if (errorDisplay) {
    errorDisplay.style.display = 'none';
  }
};

// 立即尝试清理
fastCleanup();

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('App successfully mounted.');
  } catch (err) {
    console.error('Mount Error:', err);
    // 只有在渲染彻底失败时才重新显示错误条
    const display = document.getElementById('error-display');
    if (display) {
      display.style.display = 'block';
      display.innerText = "应用渲染失败，请检查网络并刷新。";
    }
  }
}
