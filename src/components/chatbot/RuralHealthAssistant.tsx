import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';
import { getChatbotResponse } from '../../services/aiChatbotService';
import { SpeechService } from '../../services/speechService';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';

interface Props {
  onOpenSOS?: () => void;
}

export const RuralHealthAssistant: React.FC<Props> = ({ onOpenSOS }) => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();

  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [activeSpeechMsgId, setActiveSpeechMsgId] = useState<string | null>(null);

  const initialWelcome = getChatbotResponse('hello', language);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: initialWelcome.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      suggestedQuestions: initialWelcome.suggestedQuestions,
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const welcome = getChatbotResponse('hello', language);
    setMessages([
      {
        id: `msg_welcome_${language}`,
        sender: 'assistant',
        text: welcome.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        suggestedQuestions: welcome.suggestedQuestions,
      },
    ]);
  }, [language]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    const response = getChatbotResponse(query, language);

    const botMsg: ChatMessage = {
      id: `msg_bot_${Date.now() + 1}`,
      sender: 'assistant',
      text: response.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
      suggestedQuestions: response.suggestedQuestions,
      isWarning: response.isEmergency,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputMessage('');
  };

  const handleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn('Speech recognition init error', e);
      setIsListening(false);
    }
  };

  const handleSpeakResponse = (msgId: string, text: string) => {
    if (activeSpeechMsgId === msgId) {
      SpeechService.stop();
      setActiveSpeechMsgId(null);
    } else {
      SpeechService.speak(text, language);
      setActiveSpeechMsgId(msgId);
      setTimeout(() => {
        setActiveSpeechMsgId(null);
      }, 15000);
    }
  };

  const handleResetChat = () => {
    const welcome = getChatbotResponse('hello', language);
    setMessages([
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'assistant',
        text: welcome.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
        suggestedQuestions: welcome.suggestedQuestions,
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 animate-fade-in flex flex-col h-[calc(100vh-140px)] min-h-[550px]">
      {/* Header Banner */}
      <div className="gamma-card bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 rounded-3xl p-4 sm:p-5 text-white shadow-2xl flex items-center justify-between mb-4 border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/10">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">{t('chat_title')}</h1>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                {t('chat_badge')}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">{t('chat_subtitle')}</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors border border-white/10"
          title={t('chat_reset_tooltip')}
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      <div className="mb-3">
        <DisclaimerBanner compact />
      </div>

      {/* Chat Messages Log Body */}
      <div className="flex-1 gamma-card rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-lg space-y-2 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-tr-xs font-medium border border-emerald-400/30'
                  : msg.isWarning
                  ? 'bg-red-950/40 text-red-200 border border-red-500/40 rounded-tl-xs'
                  : 'bg-slate-900/85 text-slate-100 border border-white/10 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Read Aloud Button for Bot message */}
              {msg.sender === 'assistant' && (
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                  <span className="text-slate-400">{msg.timestamp}</span>
                  <button
                    onClick={() => handleSpeakResponse(msg.id, msg.text)}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    {activeSpeechMsgId === msg.id ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{t('chat_stop_audio')}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{t('chat_listen_audio')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Emergency Call-to-action */}
              {msg.isWarning && onOpenSOS && (
                <div className="pt-2">
                  <button
                    onClick={onOpenSOS}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 animate-bounce border border-red-400/40"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{t('chat_sos_cta_btn')}</span>
                  </button>
                </div>
              )}

              {/* Suggested Follow-up Questions Chips */}
              {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                <div className="pt-2 space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {t('chat_suggested_label')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(q)}
                        className="text-left text-[11px] px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/10 rounded-xl transition-colors font-semibold shadow-sm"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-xs shadow-md">
                {currentUser.name[0]}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Voice Controls */}
      <div className="pt-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 gamma-card p-2 sm:p-2.5 rounded-2xl border border-white/10 shadow-2xl focus-within:ring-2 focus-within:ring-emerald-500"
        >
          <button
            type="button"
            onClick={handleVoiceInput}
            className={`p-3 rounded-xl transition-all ${
              isListening
                ? 'bg-red-600 text-white animate-pulse shadow-lg shadow-red-600/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300'
            }`}
            title={isListening ? t('chat_stop_voice') : t('chat_voice_input')}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isListening ? t('chat_stop_voice') : t('chat_placeholder')}
            className="flex-1 px-3 py-1 text-xs sm:text-sm text-white bg-transparent focus:outline-none placeholder:text-slate-500 font-medium"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 text-white rounded-xl transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
