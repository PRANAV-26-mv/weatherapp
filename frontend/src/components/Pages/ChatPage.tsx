import React, { useState, useRef, useEffect } from 'react';
import type { CurrentWeatherData, ChatMessage } from '../../types';
import { processUserChatMessage, getLocalizedQuickPrompts } from '../../services/aiAssistant';
import {
  trainChatbotRule,
  fetchTrainedRules,
  deleteTrainedRule
} from '../../services/googleChatbotService';
import type { TrainedRule } from '../../services/googleChatbotService';
import { WeatherCard } from '../Weather/WeatherCard';
import { ForecastCard } from '../Weather/ForecastCard';
import { DisasterAlertBanner } from '../Alerts/DisasterAlertBanner';
import { VoiceButton } from '../UI/VoiceButton';
import { CameraModal } from '../UI/CameraModal';
import {
  Send, Bot, User, Camera, Paperclip, X, Image as ImageIcon,
  Key, Trash2, Copy, Check, CheckCircle2, Sparkles, GraduationCap,
  BookOpen, AlertCircle, Edit3
} from 'lucide-react';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // 🎓 AI Trainer Studio state
  const [trainedRules, setTrainedRules] = useState<TrainedRule[]>([]);
  const [isTrainerOpen, setIsTrainerOpen] = useState(false);
  const [trainerTab, setTrainerTab] = useState<'train' | 'rules'>('train');
  const [trainQuery, setTrainQuery] = useState('');
  const [trainAnswer, setTrainAnswer] = useState('');
  const [trainIntent, setTrainIntent] = useState('weather_correction');
  const [trainLang, setTrainLang] = useState(langCode);
  const [trainSubmitting, setTrainSubmitting] = useState(false);
  const [trainSuccessMsg, setTrainSuccessMsg] = useState<string | null>(null);
  const [trainErrorMsg, setTrainErrorMsg] = useState<string | null>(null);
  const [activeCorrectionContext, setActiveCorrectionContext] = useState<{ userQuery: string; originalAnswer: string } | null>(null);

  // Load existing trained rules on component mount
  const loadRules = async () => {
    try {
      const rules = await fetchTrainedRules();
      setTrainedRules(rules);
    } catch (err) {
      console.warn('Failed to load trained rules:', err);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  // Sync training language with active page language
  useEffect(() => {
    setTrainLang(langCode);
  }, [langCode]);

  // Chat messages state (starts clean without default greeting message)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const quickPrompts = getLocalizedQuickPrompts(langCode);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    const imageToAnalyze = attachedImage;
    setInputQuery('');
    setAttachedImage(null);
    setIsProcessing(true);

    const botResponse = await processUserChatMessage(query, currentWeather, langCode, imageToAnalyze, updatedMessages);
    setMessages((prev) => [...prev, botResponse]);
    setIsProcessing(false);
  };

  // 🎓 Open the correction modal pre-populated from the user's preceding question and assistant answer
  const handleOpenCorrection = (msgIndex: number, assistantMsg: ChatMessage) => {
    let precedingQuery = '';
    for (let i = msgIndex - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        precedingQuery = messages[i].text;
        break;
      }
    }
    setActiveCorrectionContext({
      userQuery: precedingQuery || 'Weather Question',
      originalAnswer: assistantMsg.text
    });
    setTrainQuery(precedingQuery || '');
    setTrainAnswer('');
    setTrainIntent('mistake_correction');
    setTrainLang(langCode);
    setTrainSuccessMsg(null);
    setTrainErrorMsg(null);
    setTrainerTab('train');
    setIsTrainerOpen(true);
  };

  // Save new training rule or mistake correction
  const handleSaveTrainingRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainQuery.trim() || !trainAnswer.trim()) return;

    setTrainSubmitting(true);
    setTrainSuccessMsg(null);
    setTrainErrorMsg(null);

    try {
      const res = await trainChatbotRule(
        trainQuery.trim(),
        trainAnswer.trim(),
        trainIntent,
        trainLang
      );

      if (res.success) {
        setTrainSuccessMsg(res.message || 'Rule successfully registered and active in WeatherGPT!');
        await loadRules();
      } else {
        setTrainErrorMsg(res.message || 'Failed to save training rule.');
      }
    } catch (err) {
      setTrainErrorMsg('Network error connecting to training backend.');
    } finally {
      setTrainSubmitting(false);
    }
  };

  // Delete a training rule
  const handleDeleteRule = async (ruleId: number) => {
    const success = await deleteTrainedRule(ruleId);
    if (success) {
      await loadRules();
    }
  };

  // Direct test in chat
  const handleTestTrainedRule = (query: string) => {
    setIsTrainerOpen(false);
    setInputQuery(query);
    handleSendMessage(query);
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
          const updatedMessages = [...messages, userMsg];
          setMessages(updatedMessages);
          setIsProcessing(true);
          processUserChatMessage('Analyze this weather image.', currentWeather, langCode, imgUrl, updatedMessages).then((botMsg) => {
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
    <div className="max-w-5xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="glass-card p-3.5 sm:p-4.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-saffron/20 text-saffron border border-saffron/40">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-heading">
              {translate('btn_ask_ai', langCode)} (WeatherGPT AI)
            </h2>
            <p className="text-[11px] text-gray-400">
              NLP Engine: <strong className="text-saffron">WeatherGPT AI</strong> • Speech STT/TTS ({langCode.toUpperCase()})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 🎓 AI Trainer Studio Button */}
          <button
            onClick={() => {
              setActiveCorrectionContext(null);
              setTrainQuery('');
              setTrainAnswer('');
              setTrainSuccessMsg(null);
              setTrainErrorMsg(null);
              setTrainerTab('train');
              setIsTrainerOpen(true);
            }}
            className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-saffron/20 hover:from-amber-500/30 hover:to-saffron/30 border border-amber-500/40 text-amber-300 text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm"
            title="Chatbot Trainer Studio: Teach questions and correct mistakes"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Trainer</span>
            {trainedRules.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-mono border border-amber-400/30">
                {trainedRules.length}
              </span>
            )}
          </button>

          {messages.length > 0 && (
            <button
              onClick={() => setMessages([])}
              className="px-2.5 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-[11px] font-bold flex items-center gap-1.5 transition-all"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Chat</span>
            </button>
          )}

          <button
            onClick={() => setIsKeyModalOpen(true)}
            className="px-2.5 py-1 rounded-full bg-saffron/10 hover:bg-saffron/20 border border-saffron/30 text-saffron text-[11px] font-bold flex items-center gap-1.5 transition-all"
            title="Configure Official Meteorological Gateway Key"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{apiKeyInput ? 'IMD / Weather Gateway (Connected)' : 'Configure Weather Gateway'}</span>
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
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-saffron/10 border border-saffron/20 text-saffron flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white font-heading">AI Weather Assistant</h3>
            <p className="text-xs text-gray-400 max-w-sm">
              Type your question below or click any suggestion prompt above to start.
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
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

                {/* Tool Badge & Actions for Assistant Responses */}
                {msg.sender === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                    {msg.toolCalled ? (
                      <span className="text-[11px] text-saffron/90 font-medium flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-saffron/10 border border-saffron/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
                        <span>{msg.toolCalled.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                      </span>
                    ) : <span />}

                    <div className="flex items-center gap-1.5">
                      {/* 🔊 Listen / Read Aloud button in current language */}
                      <VoiceButton
                        mode="output"
                        textToSpeak={msg.text}
                        langCode={langCode}
                      />

                      {/* 🎓 Teach / Correct Mistake button */}
                      <button
                        onClick={() => handleOpenCorrection(idx, msg)}
                        className="px-2 py-1 rounded-md text-amber-300 hover:text-amber-100 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors flex items-center gap-1 text-[11px] font-semibold"
                        title="Teach chatbot or correct a mistake in this answer"
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-[10px]">Teach / Fix Mistake</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(msg.id, msg.text)}
                        className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px]"
                        title="Copy response"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px] text-gray-400">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
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
              {/* Official Indian Meteorological Data Sources */}
              {msg.sender === 'assistant' && msg.sources && msg.sources.length > 0 && (
                <div className="text-[10px] text-gray-400 px-2 flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-gray-400 font-medium">Data Sources:</span>
                  <span className="text-saffron font-semibold">{msg.sources.join(' • ')}</span>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        )))}

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
        <div ref={messagesEndRef} />
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
          className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400 focus:outline-none px-2"
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

      {/* Official Meteorological Gateway Key Settings Modal */}
      {isKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel p-6 rounded-3xl border border-saffron/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-saffron font-bold text-base font-heading">
                <Key className="w-5 h-5" />
                <span>Official Meteorological Gateway Setup</span>
              </div>
              <button
                onClick={() => setIsKeyModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Enter or paste your meteorological gateway API key below to connect direct real-time forecasting and atmospheric intelligence.
            </p>

            <div className="space-y-2">
              <label className="text-[11px] text-gray-400 uppercase font-mono tracking-wider">Meteorological Gateway API Key:</label>
              <input
                type="password"
                placeholder="Paste API Key..."
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
                <span>Meteorological gateway key saved & connected successfully!</span>
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

      {/* 🎓 Chatbot Trainer Studio & Mistake Correction Modal */}
      {isTrainerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-amber-500/40 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white font-heading flex items-center gap-2">
                    <span>Chatbot Trainer Studio</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/30">
                      Ground Truth AI
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Train WeatherGPT with custom questions or correct mistaken answers in real-time.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsTrainerOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => {
                  setTrainerTab('train');
                  setTrainSuccessMsg(null);
                  setTrainErrorMsg(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  trainerTab === 'train'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Teach / Correct Mistake</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTrainerTab('rules');
                  loadRules();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  trainerTab === 'rules'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Active Knowledge Rules ({trainedRules.length})</span>
              </button>
            </div>

            {/* Tab 1: Teach / Correct Mistake Form */}
            {trainerTab === 'train' && (
              <form onSubmit={handleSaveTrainingRule} className="space-y-3.5">
                {activeCorrectionContext && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Mistake Correction Mode:</span>
                    </div>
                    <p className="text-gray-300">
                      You are fixing the bot's response to: <em className="text-white">"{activeCorrectionContext.userQuery}"</em>
                    </p>
                    {activeCorrectionContext.originalAnswer && (
                      <p className="text-[11px] text-gray-400 line-clamp-2">
                        Original Bot Output: {activeCorrectionContext.originalAnswer}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Question Pattern / Trigger Phrase:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Can I plant tomato saplings today in Sathyamangalam?"
                    value={trainQuery}
                    onChange={(e) => setTrainQuery(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none"
                  />
                  <span className="text-[10px] text-gray-400 mt-0.5 block">
                    Whenever a user asks this question (or a similar phrase), WeatherGPT will prioritize your corrected answer.
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                    Corrected Answer (Ground Truth):
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter the accurate, professional, user-friendly ground truth answer..."
                    value={trainAnswer}
                    onChange={(e) => setTrainAnswer(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Intent Category:
                    </label>
                    <select
                      value={trainIntent}
                      onChange={(e) => setTrainIntent(e.target.value)}
                      className="w-full bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="weather_correction">Weather Forecast & Rain</option>
                      <option value="activity_laundry">Outdoor Activity & Laundry</option>
                      <option value="agriculture_crops">Agriculture & Crops</option>
                      <option value="outdoor_sports">Outdoor Sports & Aviation</option>
                      <option value="meteorological_science">Atmospheric Science</option>
                      <option value="custom_training">Custom QA Correction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1">
                      Response Language:
                    </label>
                    <select
                      value={trainLang}
                      onChange={(e) => setTrainLang(e.target.value)}
                      className="w-full bg-black/40 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="hi">Hindi (हिन्दी)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                      <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      <option value="ml">Malayalam (മലയാളം)</option>
                      <option value="mr">Marathi (मराठी)</option>
                      <option value="bn">Bengali (বাংলা)</option>
                    </select>
                  </div>
                </div>

                {trainSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{trainSuccessMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTestTrainedRule(trainQuery)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/30 hover:bg-emerald-500/50 text-emerald-200 text-[11px] font-bold shrink-0 transition-colors"
                    >
                      ⚡ Test in Chat Now
                    </button>
                  </div>
                )}

                {trainErrorMsg && (
                  <div className="p-2.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{trainErrorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTrainerOpen(false)}
                    className="px-3.5 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={trainSubmitting || !trainQuery.trim() || !trainAnswer.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-saffron text-black font-bold text-xs flex items-center gap-1.5 shadow-lg hover:brightness-110 disabled:opacity-50 transition-all"
                  >
                    {trainSubmitting ? (
                      <span>Training WeatherGPT...</span>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Deploy Training Rule</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Tab 2: Active Rules Knowledge Base */}
            {trainerTab === 'rules' && (
              <div className="space-y-3">
                {trainedRules.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <GraduationCap className="w-10 h-10 text-gray-500 mx-auto" />
                    <p className="text-xs text-gray-400 font-semibold">No custom training rules registered yet.</p>
                    <p className="text-[11px] text-gray-500">
                      Use the "Teach / Correct Mistake" tab or the button on any chat message to train WeatherGPT!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {trainedRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition-all space-y-1.5 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span className="text-amber-400">Q:</span>
                            <span>{rule.query_pattern}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                              {rule.language_code.toUpperCase()}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRule(rule.id)}
                              className="p-1 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-md transition-colors"
                              title="Delete this training rule"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="text-gray-300 pl-4 border-l-2 border-amber-400/50 text-[11px] line-clamp-3">
                          <span className="text-gray-400 font-semibold">A: </span>
                          {rule.corrected_answer}
                        </div>

                        <div className="flex items-center justify-between pt-1 text-[10px] text-gray-400">
                          <span className="capitalize">Intent: {rule.target_intent.replace(/_/g, ' ')}</span>
                          <button
                            type="button"
                            onClick={() => handleTestTrainedRule(rule.query_pattern)}
                            className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                          >
                            <span>⚡ Ask in Chat</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
