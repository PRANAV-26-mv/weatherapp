import React, { useState, useEffect } from 'react';
import type { CurrentWeatherData, ChatMessage } from '../../types';
import { processUserChatMessage, getLocalizedWelcomeMessage, getLocalizedQuickPrompts } from '../../services/aiAssistant';
import { WeatherCard } from '../Weather/WeatherCard';
import { ForecastCard } from '../Weather/ForecastCard';
import { DisasterAlertBanner } from '../Alerts/DisasterAlertBanner';
import { VoiceButton } from '../UI/VoiceButton';
import { CameraModal } from '../UI/CameraModal';
import { Send, Bot, User, CheckCircle2, Camera, Paperclip, X, Image as ImageIcon, Key } from 'lucide-react';
import { translate } from '../../services/i18n';

interface ChatPageProps {
  currentWeather: CurrentWeatherData;
  langCode?: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({ currentWeather, langCode = 'en' }) => {
  const [inputQuery, setInputQuery] = useState('');
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('VITE_GEMINI_API_KEY') || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: getLocalizedWelcomeMessage(currentWeather.locationName, langCode),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      weatherCard: currentWeather,
      sources: ['Google Cloud Gemini 1.5 Flash AI', 'Open-Meteo High Resolution Weather API'],
    },
  ]);

  // Update initial welcome message if user switches language while on ChatPage
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-1') {
        return [
          {
            id: 'welcome-1',
            sender: 'assistant',
            text: getLocalizedWelcomeMessage(currentWeather.locationName, langCode),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            weatherCard: currentWeather,
            sources: ['Google Cloud Gemini 1.5 Flash AI', 'Open-Meteo High Resolution Weather API'],
          },
        ];
      }
      return prev;
    });
  }, [langCode, currentWeather]);

  const quickPrompts = getLocalizedQuickPrompts(langCode);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputQuery || (attachedImage ? 'Analyze this attached weather image.' : '');
    if (!query.trim() && !attachedImage) return;
    if (isProcessing) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const imageToAnalyze = attachedImage;
    setInputQuery('');
    setAttachedImage(null);
    setIsProcessing(true);

    const botResponse = await processUserChatMessage(query, currentWeather, langCode, imageToAnalyze);
    setMessages((prev) => [...prev, botResponse]);
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        if (evt.target?.result) {
          const imgUrl = evt.target.result as string;
          setAttachedImage(imgUrl);
          // Instantly trigger AI Vision analysis
          const userMsg: ChatMessage = {
            id: `user-${Date.now()}`,
            sender: 'user',
            text: '📷 Attached photo for AI Weather Vision Diagnostic Analysis.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
          setMessages((prev) => [...prev, userMsg]);
          setIsProcessing(true);
          processUserChatMessage('Analyze this weather image.', currentWeather, langCode, imgUrl).then((botMsg) => {
            setMessages((prev) => [...prev, botMsg]);
            setIsProcessing(false);
            setAttachedImage(null);
          });
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="glass-card p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-saffron/20 text-saffron border border-saffron/40">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-white font-heading">
              {translate('btn_ask_ai', langCode)} (WeatherGPT AI)
            </h2>
            <p className="text-xs text-gray-400">
              NLP Engine: <strong className="text-saffron">Google Cloud Gemini 1.5 Flash AI</strong> • Speech STT/TTS ({langCode.toUpperCase()})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="px-3 py-1.5 rounded-full bg-saffron/10 hover:bg-saffron/20 border border-saffron/30 text-saffron text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Configure Google Cloud Gemini API Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKeyInput ? 'Google Cloud API (Connected)' : 'Configure Google Cloud API'}</span>
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-3 py-1.5 rounded-full glass-pill text-xs text-gray-300 hover:text-white hover:border-saffron/60 transition-all shrink-0"
          >
            💬 {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="space-y-6 min-h-[420px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-saffron/20 border border-saffron/40 text-saffron flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div className={`max-w-3xl space-y-4 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-saffron text-black font-semibold rounded-tr-none shadow-lg'
                    : 'glass-card border-white/10 text-gray-100 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>

                {/* Voice Readout Button for Assistant Responses */}
                {msg.sender === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between">
                    <VoiceButton mode="output" textToSpeak={msg.text} langCode={langCode} />
                    {msg.toolCalled && (
                      <span className="text-[10px] text-saffron font-mono flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-saffron" />
                        <span>Tool: {msg.toolCalled}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Embedded Vision Analysis Diagnostic Card */}
              {msg.imageAnalysis && (
                <div className="glass-panel p-4 rounded-2xl border border-saffron/40 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-saffron font-bold">
                    <ImageIcon className="w-4 h-4" />
                    <span>Analyzed Weather Photograph:</span>
                  </div>
                  <div className="h-44 rounded-xl overflow-hidden border border-white/10">
                    <img src={msg.imageAnalysis.imageUrl} alt="Sky target" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 space-y-2">
                    <div className="text-white font-bold text-sm">{msg.imageAnalysis.cloudType}</div>
                    <div className="text-gray-300">Precipitation Likelihood: <strong className="text-saffron">{msg.imageAnalysis.precipitationLikelihoodPct}%</strong></div>
                    
                    {msg.imageAnalysis.detailedAnalysis && (
                      <div className="pt-2 border-t border-white/10 text-gray-200">
                        <span className="text-saffron font-bold block text-[11px]">🔍 What Is Happening:</span>
                        <p className="mt-0.5 leading-relaxed">{msg.imageAnalysis.detailedAnalysis}</p>
                      </div>
                    )}

                    {msg.imageAnalysis.safetyPrecautions && msg.imageAnalysis.safetyPrecautions.length > 0 && (
                      <div className="pt-2 border-t border-white/10">
                        <span className="text-amber-400 font-bold block text-[11px]">🚨 Recommended Safety Precautions:</span>
                        <ul className="mt-1 space-y-1 text-gray-200">
                          {msg.imageAnalysis.safetyPrecautions.map((p, pI) => (
                            <li key={pI} className="flex items-start gap-1">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-[11px] text-emerald-400 font-semibold pt-1">Sensor Alignment: {msg.imageAnalysis.liveComparison.agreementRating}</div>
                  </div>
                </div>
              )}

              {/* Embedded Weather Cards */}
              {msg.weatherCard && <WeatherCard weather={msg.weatherCard} langCode={langCode} />}
              {msg.forecastData && <ForecastCard hourly={[]} daily={msg.forecastData} />}
              {msg.alertData && <DisasterAlertBanner alert={msg.alertData} />}

              {/* Data Sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="text-[10px] text-gray-400 px-2 flex items-center gap-2">
                  <span>Data Sources:</span>
                  <span className="text-gray-300 font-semibold">{msg.sources.join(' • ')}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3 items-center">
            <div className="w-8 h-8 rounded-full bg-saffron/20 text-saffron flex items-center justify-center animate-spin">
              <Bot className="w-4 h-4" />
            </div>
            <div className="glass-card p-3 rounded-2xl text-xs text-saffron animate-pulse">
              Analyzing query & weather vision telemetry in {langCode.toUpperCase()}...
            </div>
          </div>
        )}
      </div>

      {/* Attached Image Preview Bar */}
      {attachedImage && (
        <div className="glass-panel p-2 rounded-xl border border-saffron/50 flex items-center justify-between w-fit gap-3">
          <div className="flex items-center gap-2">
            <img src={attachedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg" />
            <span className="text-xs text-gray-200 font-bold">Image Attached for Vision Analysis</span>
          </div>
          <button
            onClick={() => setAttachedImage(null)}
            className="p-1 rounded-full text-gray-400 hover:text-red-400 hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input Toolbar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="glass-panel p-2.5 rounded-2xl border border-white/15 flex items-center gap-1.5 md:gap-2 sticky bottom-16 md:bottom-4 z-40 shadow-2xl backdrop-blur-xl"
      >
        {/* Voice Input (Speech-to-Text in Selected Language) */}
        <VoiceButton
          onSpeechResult={(transcript) => {
            setInputQuery(transcript);
            handleSendMessage(transcript);
          }}
          langCode={langCode}
        />

        {/* Live Camera Snap Button */}
        <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="p-2 rounded-xl bg-white/5 hover:bg-saffron/20 text-gray-300 hover:text-saffron border border-white/10 transition-colors"
          title="Snap Live Sky Photo via Camera"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* File Image Attachment Button */}
        <label
          className="p-2 rounded-xl bg-white/5 hover:bg-saffron/20 text-gray-300 hover:text-saffron border border-white/10 transition-colors cursor-pointer"
          title="Attach Sky or Radar Photo File"
        >
          <Paperclip className="w-4 h-4" />
          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </label>

        <input
          type="text"
          placeholder={`${translate('btn_ask_ai', langCode)} (${langCode.toUpperCase()})...`}
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none px-2"
        />

        <button
          type="submit"
          disabled={(!inputQuery.trim() && !attachedImage) || isProcessing}
          className="saffron-gradient-btn px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Live Webcam/Phone Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCaptureImage={(dataUrl) => {
          setAttachedImage(dataUrl);
          handleSendMessage('Analyze this camera photo of the sky for weather risk.');
        }}
      />

      {/* Google Cloud API Key Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-saffron/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-saffron font-bold text-base font-heading">
                <Key className="w-5 h-5" />
                <span>Google Cloud Gemini API Setup</span>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Enter or paste your Google Cloud Gemini API key below to connect direct LLM generative intelligence. You can obtain a free API key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-saffron underline font-bold">Google AI Studio</a>.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">Google Cloud API Key:</label>
              <input
                type="password"
                placeholder="AIzaSy..."
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setSavedSuccess(false);
                }}
                className="w-full bg-black/40 border border-white/20 focus:border-saffron rounded-xl p-3 text-xs text-white placeholder-gray-500 font-mono focus:outline-none"
              />
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Google Cloud Gemini API key saved & connected successfully!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {apiKeyInput && (
                <button
                  onClick={() => {
                    localStorage.removeItem('VITE_GEMINI_API_KEY');
                    setApiKeyInput('');
                    setSavedSuccess(false);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs font-bold transition-colors"
                >
                  Clear Key
                </button>
              )}

              <button
                onClick={() => {
                  localStorage.setItem('VITE_GEMINI_API_KEY', apiKeyInput.trim());
                  setSavedSuccess(true);
                  setTimeout(() => {
                    setIsKeyModalOpen(false);
                  }, 1200);
                }}
                className="saffron-gradient-btn px-5 py-2 rounded-xl text-xs font-bold"
              >
                Save & Connect Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
