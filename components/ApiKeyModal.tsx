
import React from 'react';

interface ApiKeyModalProps {
  onSuccess: () => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSuccess }) => {
  const handleOpenSelectKey = async () => {
    if (window.aistudio && window.aistudio.openSelectKey) {
      await window.aistudio.openSelectKey();
      onSuccess();
    } else {
      alert("API Key selection is not available in this environment.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">需要选择 API Key</h2>
        <p className="text-gray-600 mb-8">
          生成视频功能需要使用您的付费 API Key。请在弹出的对话框中选择一个已启用计费的项目。
          <br />
          <a 
            href="https://ai.google.dev/gemini-api/docs/billing" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline text-sm mt-2 block"
          >
            了解关于计费的更多信息
          </a>
        </p>
        <button
          onClick={handleOpenSelectKey}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg active:scale-95"
        >
          立即选择 API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyModal;
