
import React, { useState, useEffect } from 'react';
import { FestivalType, TargetAudience, GreetingState } from './types.ts';
import { GeminiService } from './services/gemini.ts';
import ApiKeyModal from './components/ApiKeyModal.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<GreetingState>({
    festival: FestivalType.SPRING_FESTIVAL,
    audience: TargetAudience.COLLEAGUES,
    keywords: '',
    generatedText: '',
    imageUrl: '',
    videoUrl: '',
    audioUrl: '',
    isGeneratingText: false,
    isGeneratingImage: false,
    isGeneratingVideo: false,
    isGeneratingAudio: false,
  });

  const [hasApiKey, setHasApiKey] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && window.aistudio.hasSelectedApiKey) {
        const has = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '节日祝福生成器',
          text: '帮我试下这个行政祝福助手，生成的祝福语和配音挺不错的！',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share canceled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板，快发给朋友吧！');
    }
  };

  const handleGenerateText = async () => {
    setState(prev => ({ ...prev, isGeneratingText: true }));
    try {
      const text = await GeminiService.generateGreeting(state.festival, state.audience, state.keywords);
      setState(prev => ({ ...prev, generatedText: text }));
    } catch (error) {
      console.error(error);
      alert("文案生成失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setState(prev => ({ ...prev, isGeneratingText: false }));
    }
  };

  const handleGenerateImage = async () => {
    if (!state.generatedText) {
      alert("请先生成或输入祝福语");
      return;
    }
    setState(prev => ({ ...prev, isGeneratingImage: true }));
    try {
      const url = await GeminiService.generateImage(state.generatedText, state.festival);
      setState(prev => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error(error);
      alert("图片生成失败");
    } finally {
      setState(prev => ({ ...prev, isGeneratingImage: false }));
    }
  };

  const handleGenerateAudio = async () => {
    if (!state.generatedText) {
      alert("请先生成祝福语");
      return;
    }
    setState(prev => ({ ...prev, isGeneratingAudio: true }));
    try {
      const url = await GeminiService.generateAudio(state.generatedText, state.festival, state.audience);
      setState(prev => ({ ...prev, audioUrl: url }));
    } catch (error) {
      console.error(error);
      alert("音频生成失败");
    } finally {
      setState(prev => ({ ...prev, isGeneratingAudio: false }));
    }
  };

  const handleGenerateVideo = async () => {
    if (!hasApiKey) {
      setShowKeyModal(true);
      return;
    }
    if (!state.generatedText) {
      alert("请先生成或输入祝福语");
      return;
    }
    setState(prev => ({ ...prev, isGeneratingVideo: true }));
    try {
      const url = await GeminiService.generateVideo(state.generatedText, state.festival, state.imageUrl);
      setState(prev => ({ ...prev, videoUrl: url }));
    } catch (error) {
      console.error(error);
      if (error instanceof Error && error.message.includes("Requested entity was not found")) {
        setHasApiKey(false);
        setShowKeyModal(true);
      } else {
        alert("视频生成失败。由于视频生成较为复杂，请确保网络通畅且 API Key 余额充足。");
      }
    } finally {
      setState(prev => ({ ...prev, isGeneratingVideo: false }));
    }
  };

  return (
    <div className="min-h-screen pb-20 select-none">
      {showKeyModal && <ApiKeyModal onSuccess={() => { setShowKeyModal(false); setHasApiKey(true); }} />}

      <header className="bg-white border-b sticky top-0 z-40 px-4 py-3 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-red-600 text-white p-1.5 md:p-2 rounded-lg shadow-inner">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <h1 className="text-lg md:text-2xl font-bold text-gray-800 tracking-tight">节日祝福生成器</h1>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            {deferredPrompt && (
              <button 
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full text-xs md:text-sm font-bold border border-red-100 hover:bg-red-100 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                安装应用
              </button>
            )}
            <button 
              onClick={handleShare}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="分享应用"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-1.5 h-6 bg-red-600 rounded-full"></span>
              参数设置
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">节日</label>
                  <select className="w-full p-3 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 transition-all outline-none" value={state.festival} onChange={(e) => setState(s => ({ ...s, festival: e.target.value as FestivalType }))}>
                    {Object.values(FestivalType).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">对象</label>
                  <select className="w-full p-3 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 transition-all outline-none" value={state.audience} onChange={(e) => setState(s => ({ ...s, audience: e.target.value as TargetAudience }))}>
                    {Object.values(TargetAudience).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">核心关键词</label>
                <textarea className="w-full p-4 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-red-500 transition-all outline-none resize-none" rows={2} placeholder="如：步步高升、健康平安..." value={state.keywords} onChange={(e) => setState(s => ({ ...s, keywords: e.target.value }))} />
              </div>
              <button onClick={handleGenerateText} disabled={state.isGeneratingText} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingText ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200'}`}>
                {state.isGeneratingText ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent" /> : '开始智能创作'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
              文案内容
            </h2>
            <textarea className="w-full p-4 border-0 rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none mb-4 text-gray-800 leading-relaxed font-medium" rows={5} value={state.generatedText} onChange={(e) => setState(s => ({ ...s, generatedText: e.target.value }))} placeholder="祝福语生成后可在此手动修改..." />
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={handleGenerateImage} disabled={state.isGeneratingImage || !state.generatedText} className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingImage || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {state.isGeneratingImage ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" /> : '绘出意境'}
              </button>
              <button onClick={handleGenerateAudio} disabled={state.isGeneratingAudio || !state.generatedText} className={`py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingAudio || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                {state.isGeneratingAudio ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" /> : '配以雅乐'}
              </button>
            </div>
            <button onClick={handleGenerateVideo} disabled={state.isGeneratingVideo || !state.generatedText} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingVideo || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'}`}>
              {state.isGeneratingVideo ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : '生成 15s 高清动态祝福'}
            </button>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 min-h-[500px]">
            <h2 className="text-lg font-semibold mb-6 flex items-center gap-2 text-gray-800">
              <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
              预览工作台
            </h2>
            {!state.imageUrl && !state.videoUrl && !state.audioUrl && !state.isGeneratingImage && !state.isGeneratingVideo && !state.isGeneratingAudio ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-gray-300 border-2 border-dashed border-gray-50 rounded-3xl">
                <div className="w-20 h-20 mb-4 bg-gray-50 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="font-bold">生成内容后，这里将展示完整效果</p>
                <p className="text-xs mt-2">支持高清导出与分享</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(state.imageUrl || state.isGeneratingImage) && (
                  <div className="relative group rounded-3xl overflow-hidden shadow-2xl shadow-gray-200">
                    {state.isGeneratingImage ? (
                      <div className="bg-gray-50 aspect-video flex flex-col items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent" />
                        <p className="text-sm text-blue-600 font-bold">正在渲染画卷...</p>
                      </div>
                    ) : (
                      <div className="relative group">
                        <img src={state.imageUrl} className="w-full aspect-video object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                          <p className="text-white text-center text-lg md:text-2xl font-bold leading-relaxed tracking-wide drop-shadow-2xl">{state.generatedText}</p>
                        </div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] text-white border border-white/30 font-bold uppercase tracking-widest">Preview Card</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {(state.audioUrl || state.isGeneratingAudio) && (
                  <div className="bg-amber-50/50 backdrop-blur-sm border border-amber-100 p-5 rounded-2xl flex flex-col gap-3">
                    {state.isGeneratingAudio ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-bounce h-1.5 w-1.5 bg-amber-500 rounded-full" />
                        <div className="animate-bounce h-3 w-1.5 bg-amber-500 rounded-full [animation-delay:0.2s]" />
                        <div className="animate-bounce h-2 w-1.5 bg-amber-500 rounded-full [animation-delay:0.4s]" />
                        <span className="text-sm text-amber-700 font-bold">正在调制节日乐章...</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-amber-800 uppercase tracking-tighter">专属节日配音</span>
                          <span className="text-[10px] text-amber-500 px-2 py-0.5 bg-amber-100 rounded-full font-bold">WAV High Quality</span>
                        </div>
                        <audio src={state.audioUrl} controls className="w-full h-10 filter sepia" />
                      </>
                    )}
                  </div>
                )}

                {(state.videoUrl || state.isGeneratingVideo) && (
                  <div className="rounded-3xl overflow-hidden shadow-2xl bg-black border-4 border-white shadow-indigo-100">
                    {state.isGeneratingVideo ? (
                      <div className="aspect-video flex flex-col items-center justify-center gap-4 text-white p-8">
                        <div className="relative">
                          <div className="animate-ping absolute inset-0 rounded-full bg-indigo-500 opacity-20" />
                          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-400 border-t-transparent relative z-10" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-black mb-1">正在制作 15s 高清动画</p>
                          <p className="text-[10px] text-gray-500 max-w-[200px]">这通常需要 1 到 2 分钟，你可以先去处理其他行政事务，别刷新页面哦</p>
                        </div>
                      </div>
                    ) : (
                      <video src={state.videoUrl} controls className="w-full" autoPlay loop playsInline />
                    )}
                  </div>
                )}

                {(state.imageUrl || state.videoUrl || state.audioUrl) && (
                  <div className="pt-6 flex flex-wrap gap-3">
                    {state.imageUrl && (
                      <button onClick={() => { const l = document.createElement('a'); l.href = state.imageUrl; l.download = `祝福-${state.festival}.png`; l.click(); }} className="px-6 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all flex items-center gap-2 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        保存贺卡
                      </button>
                    )}
                    {state.audioUrl && (
                      <button onClick={() => { const l = document.createElement('a'); l.href = state.audioUrl; l.download = '配音.wav'; l.click(); }} className="px-6 py-3 bg-amber-600 text-white text-xs font-black rounded-2xl hover:bg-amber-700 transition-all flex items-center gap-2 active:scale-95">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        下载配音
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-20 text-center pb-8 border-t pt-10 border-gray-100">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-full border border-gray-100 mb-4">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Service Online · Version 3.0 PWA</span>
        </div>
        <p className="text-gray-400 text-[10px] font-bold">专为企业行政公关打造 · 高端节日祝福一键生成</p>
      </footer>
    </div>
  );
};

export default App;
