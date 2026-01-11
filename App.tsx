
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
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

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
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("【iPhone 一键安装指引】\n\n1. 请使用 Safari 浏览器打开\n2. 点击屏幕底部中间的【分享】按钮（方框箭头）\n3. 向上滑动找到并点击【添加到主屏幕】\n\n完成后，桌面就会出现“节日祝福”App 图标！");
    } else {
      alert("【安装指引】\n\n电脑用户：点击地址栏右侧的“安装”图标。\n安卓用户：点击浏览器菜单中的“安装应用”或“添加到主屏幕”。");
    }
  };

  const handleInvite = () => {
    const currentUrl = window.location.href.split('?')[0].split('#')[0];
    const message = `🎊 推荐一个超好用的【节日祝福生成器】\n\n行政/公关必备！一键生成：\n✍️ 专业祝福文案\n🎨 精美节日贺卡\n🎙️ 磁性真人配音\n🎬 15秒动态祝福视频\n\n👇 点击链接立即体验（可安装到桌面）：\n${currentUrl}\n\n💡 提示：打开后点击“安装”或“添加到主屏幕”，使用更方便！`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        alert("✅ 邀请口令已复制！\n\n您可以直接粘贴发送给微信/钉钉的朋友了。\n请确保发送的是这个地址：\n" + currentUrl);
      });
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
    <div className="min-h-screen pb-20 select-none bg-slate-50">
      {showKeyModal && <ApiKeyModal onSuccess={() => { setShowKeyModal(false); setHasApiKey(true); }} />}

      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-40 px-4 py-3 md:px-8 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="bg-red-600 text-white p-2 rounded-xl shadow-lg shadow-red-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-black text-gray-900 leading-none">节日祝福</h1>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Generator Pro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleInstall}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs md:text-sm font-black transition-all transform active:scale-95 ${deferredPrompt ? 'bg-red-600 text-white shadow-lg shadow-red-200 animate-pulse' : 'bg-white text-red-600 border border-red-100'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {deferredPrompt ? '立即安装' : '安装 App'}
            </button>

            <button 
              onClick={handleInvite}
              className="px-4 py-2 bg-gray-900 text-white rounded-full text-xs md:text-sm font-black flex items-center gap-1.5 hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              邀请安装
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
              Settings 参数设置
            </h2>
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 ml-1">节日类型</label>
                  <select className="w-full p-4 border-0 rounded-2xl bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-red-500 transition-all outline-none appearance-none" value={state.festival} onChange={(e) => setState(s => ({ ...s, festival: e.target.value as FestivalType }))}>
                    {Object.values(FestivalType).map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-gray-400 ml-1">受众群体</label>
                  <select className="w-full p-4 border-0 rounded-2xl bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-red-500 transition-all outline-none appearance-none" value={state.audience} onChange={(e) => setState(s => ({ ...s, audience: e.target.value as TargetAudience }))}>
                    {Object.values(TargetAudience).map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 ml-1">风格关键词</label>
                <textarea className="w-full p-4 border-0 rounded-2xl bg-gray-50 font-bold text-gray-700 focus:ring-2 focus:ring-red-500 transition-all outline-none resize-none" rows={2} placeholder="例如：前程似锦、宏图大展..." value={state.keywords} onChange={(e) => setState(s => ({ ...s, keywords: e.target.value }))} />
              </div>
              <button onClick={handleGenerateText} disabled={state.isGeneratingText} className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${state.isGeneratingText ? 'bg-gray-100 text-gray-400' : 'bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-200'}`}>
                {state.isGeneratingText ? <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-600 border-t-transparent" /> : 'AI 智能创作文案'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
              Content 文案编辑
            </h2>
            <textarea className="w-full p-5 border-0 rounded-2xl bg-gray-50 font-medium text-gray-800 leading-relaxed focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none mb-4" rows={5} value={state.generatedText} onChange={(e) => setState(s => ({ ...s, generatedText: e.target.value }))} placeholder="文案将在此生成..." />
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={handleGenerateImage} disabled={state.isGeneratingImage || !state.generatedText} className={`py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${state.isGeneratingImage || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                {state.isGeneratingImage ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" /> : '生成艺术图片'}
              </button>
              <button onClick={handleGenerateAudio} disabled={state.isGeneratingAudio || !state.generatedText} className={`py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all ${state.isGeneratingAudio || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}>
                {state.isGeneratingAudio ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-amber-600 border-t-transparent" /> : '录制语音祝福'}
              </button>
            </div>
            <button onClick={handleGenerateVideo} disabled={state.isGeneratingVideo || !state.generatedText} className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${state.isGeneratingVideo || !state.generatedText ? 'bg-gray-50 text-gray-300' : 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white shadow-xl shadow-indigo-200'}`}>
              {state.isGeneratingVideo ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : '生成 15s 高清动态祝福'}
            </button>
          </div>
        </section>

        <section className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
            <h2 className="text-sm font-black mb-8 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
              Workbench 预览工作台
            </h2>
            
            <div className="flex-1 flex flex-col justify-center">
              {!state.imageUrl && !state.videoUrl && !state.audioUrl && !state.isGeneratingImage && !state.isGeneratingVideo && !state.isGeneratingAudio ? (
                <div className="text-center py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-400 font-black text-sm">生成内容后，这里将实时呈现视觉效果</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* 图片预览 */}
                  {(state.imageUrl || state.isGeneratingImage) && (
                    <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-slate-200 border-4 border-white">
                      {state.isGeneratingImage ? (
                        <div className="aspect-video bg-slate-50 flex flex-col items-center justify-center gap-3">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Rendering Art...</p>
                        </div>
                      ) : (
                        <div className="relative group">
                          <img src={state.imageUrl} className="w-full aspect-video object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-6 md:p-10">
                            <p className="text-white text-center text-lg md:text-xl font-bold leading-relaxed drop-shadow-lg">{state.generatedText}</p>
                          </div>
                          <button onClick={() => { const a = document.createElement('a'); a.href = state.imageUrl; a.download = 'greeting.png'; a.click(); }} className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white transition-all opacity-0 group-hover:opacity-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 音频预览 */}
                  {(state.audioUrl || state.isGeneratingAudio) && (
                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-4">
                      <div className="bg-amber-500 text-white p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.414 0A5.982 5.982 0 0115 10a5.982 5.982 0 01-1.414 4.243 1 1 0 11-1.414-1.414A3.982 3.982 0 0013 10a3.982 3.982 0 00-1.414-2.828a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      {state.isGeneratingAudio ? (
                        <div className="flex-1 flex gap-1">
                          {[...Array(12)].map((_, i) => <div key={i} className="h-4 w-1 bg-amber-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />)}
                        </div>
                      ) : (
                        <audio src={state.audioUrl} controls className="flex-1 h-8 filter sepia hue-rotate-15 opacity-80" />
                      )}
                    </div>
                  )}

                  {/* 视频预览 */}
                  {(state.videoUrl || state.isGeneratingVideo) && (
                    <div className="bg-slate-900 rounded-[2.5rem] p-2 md:p-3 shadow-2xl overflow-hidden border-8 border-slate-800">
                      {state.isGeneratingVideo ? (
                        <div className="aspect-video flex flex-col items-center justify-center text-white p-10 text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-6" />
                          <h3 className="text-lg font-black mb-2">正在合成 15s 电影级祝福</h3>
                          <p className="text-xs text-slate-500 font-bold max-w-[240px]">由于视频渲染较慢，约需 60-120 秒，请勿离开或刷新页面...</p>
                        </div>
                      ) : (
                        <video src={state.videoUrl} controls className="w-full rounded-[1.8rem]" autoPlay loop playsInline />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-6xl mx-auto px-4 mt-20 text-center pb-12 border-t border-slate-200 pt-12">
        <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-white shadow-sm border border-slate-100 rounded-full mb-6">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            App Live: {window.location.hostname || 'Localhost'}
          </span>
        </div>
        <p className="text-slate-400 text-xs font-bold leading-relaxed">
          Powered by Gemini 3.0 & Veo 3.1<br />
          专为企业行政公关打造的高端节日祝福生成器
        </p>
      </footer>
    </div>
  );
};

export default App;
