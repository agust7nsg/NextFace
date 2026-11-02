import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Loader2, Copy, ThumbsUp, Volume2, MoreVertical, Plus, RefreshCw, Mic } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { getSignedUrl } from '../lib/storage';
import { getChatMessages } from '../lib/chat';
import { tr } from '../contexts/LanguageContext';
import { extractInvokeErrorMessage } from '../lib/invokeError';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  isTemp?: boolean;
}

interface ChatPageProps {
  onBack: () => void;
  analysisId: string;
  analysisScore?: number;
}

export default function ChatPage({ onBack, analysisId, analysisScore }: ChatPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [analysisImageUrl, setAnalysisImageUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!analysisId) return;
    supabase
      .from('facial_analyses')
      .select('image_url')
      .eq('id', analysisId)
      .maybeSingle()
      .then(async ({ data }) => {
        if (data?.image_url) {
          if (data.image_url.startsWith('http')) {
            setAnalysisImageUrl(data.image_url);
          } else {
            const signed = await getSignedUrl(data.image_url);
            if (signed) setAnalysisImageUrl(signed);
          }
        }
      });
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId || !user) return;

    getChatMessages(user.id, analysisId).then(rows => {
      setMessages(rows.map(r => ({
        id: r.id,
        role: r.role,
        content: r.content,
        created_at: r.created_at,
      })));
    });

    const channel = supabase
      .channel(`chat_messages:${analysisId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `analysis_id=eq.${analysisId}`,
        },
        (payload) => {
          const row = payload.new as ChatMessage;
          setMessages(prev => {
            const filtered = prev.filter(m => {
              if (!m.isTemp) return true;
              return m.content !== row.content || m.role !== row.role;
            });
            if (filtered.some(m => m.id === row.id)) return filtered;
            return [...filtered, row];
          });
        }
      )
      .subscribe(() => {});

    return () => {
      supabase.removeChannel(channel);
    };
  }, [analysisId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const autoResize = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
  };

  const handleSend = async (text?: string) => {
    const content = (text ?? inputValue).trim();
    if (!content || sending || !user || !analysisId) return;

    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setSending(true);

    const tempId = 'temp-' + Date.now();
    const tempMessage: ChatMessage = {
      id: tempId,
      role: 'user',
      content,
      created_at: new Date().toISOString(),
      isTemp: true,
    };
    setMessages(prev => [...prev, tempMessage]);

    const { error: insertError } = await supabase.from('chat_messages').insert({
      role: 'user',
      content,
      user_id: user.id,
      analysis_id: analysisId,
    });

    if (insertError) {
      console.error('Failed to send message:', insertError);
      setMessages(prev => prev.filter(m => m.id !== tempId));
      setSending(false);
      return;
    }

    supabase.from('user_events').insert({
      user_id: user.id,
      event_type: 'chat_message_sent',
      metadata: { analysis_id: analysisId }
    }).then(undefined, e => console.error('Failed to log chat_message_sent event:', e));

    try {
      const { data, error: fnError } = await supabase.functions.invoke('gptmini-chat', {
        body: { analysisId, message: content },
        headers: { 'x-app-token': import.meta.env.VITE_APP_TOKEN ?? '' },
      });

      if (fnError) {
        console.error('Failed to get AI response:', fnError);
        const serverMessage = await extractInvokeErrorMessage(fnError);
        if (serverMessage) {
          const fallbackId = 'ai-' + Date.now();
          setMessages(prev => [...prev, {
            id: fallbackId,
            role: 'assistant',
            content: serverMessage,
            created_at: new Date().toISOString(),
            isTemp: true,
          }]);
        }
      } else if (data?.rate_limited && data?.error) {
        const fallbackId = 'ai-' + Date.now();
        setMessages(prev => [...prev, {
          id: fallbackId,
          role: 'assistant',
          content: data.error,
          created_at: new Date().toISOString(),
          isTemp: true,
        }]);
      } else if (data?.content) {
        const fallbackId = 'ai-' + Date.now();
        setMessages(prev => {
          if (prev.some(m => m.content === data.content && m.role === 'assistant')) return prev;
          return [...prev, {
            id: fallbackId,
            role: 'assistant',
            content: data.content,
            created_at: new Date().toISOString(),
            isTemp: true,
          }];
        });
      }
    } catch (e) {
      console.error('Edge function call failed:', e);
    } finally {
      setSending(false);
    }

    if (user?.id) {
      supabase
        .from("facial_profiles")
        .update({ last_active_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .then(({ error }) => {
          if (error) console.error('Failed to update last_active_at:', error);
        });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userInitial = user?.email?.[0]?.toUpperCase() ?? 'U';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse 100% 60% at 50% 35%, rgba(14,90,190,0.22) 0%, transparent 65%), #0d0d0d' }}>
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#111111]/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#0d0d0d] border-2 border-white/80 flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="headerSparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                  <path d="M20 2 C20 2 21.8 11.5 26 16 C30.2 20.5 38 20 38 20 C38 20 30.2 19.5 26 24 C21.8 28.5 20 38 20 38 C20 38 18.2 28.5 14 24 C9.8 19.5 2 20 2 20 C2 20 9.8 20.5 14 16 C18.2 11.5 20 2 20 2Z" fill="url(#headerSparkGrad)" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">NextFace AI</p>
                <p className="text-xs text-slate-400 leading-tight">
                  {analysisScore ? tr(`Score ${analysisScore} Analysis`, `Análisis Puntuación ${analysisScore}`) : tr('Face Analysis Chat', 'Chat de Análisis Facial')}
                </p>
              </div>
            </div>
          </div>
          <button className="p-2 rounded-xl hover:bg-white/5 transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
          {messages.length === 0 && !sending && (
            <div className="flex flex-col items-center w-full gap-6 pt-8">
              <div className="relative w-24 h-24 rounded-full overflow-hidden" style={{ boxShadow: '0 0 20px 4px rgba(34,211,238,0.12)' }}>
                {analysisImageUrl ? (
                  <img src={analysisImageUrl} alt="Analysis" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 40 40" className="w-12 h-12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="sparkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#22d3ee" />
                          <stop offset="50%" stopColor="#38bdf8" />
                          <stop offset="100%" stopColor="#2563eb" />
                        </linearGradient>
                      </defs>
                      <path d="M20 2 C20 2 21.8 11.5 26 16 C30.2 20.5 38 20 38 20 C38 20 30.2 19.5 26 24 C21.8 28.5 20 38 20 38 C20 38 18.2 28.5 14 24 C9.8 19.5 2 20 2 20 C2 20 9.8 20.5 14 16 C18.2 11.5 20 2 20 2Z" fill="url(#sparkGrad)" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="text-center px-4">
                <h2 className="text-2xl font-bold text-white mb-2">{tr('Ask About Your Analysis', 'Pregunta sobre tu análisis')}</h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                  {tr('Get personalized insights, ask questions about your score, and receive expert advice on improving your facial aesthetics.', 'Obtén consejos personalizados, haz preguntas sobre tu puntuación y recibe asesoría experta para mejorar tu estética facial.')}
                </p>
              </div>
            </div>
          )}
          {(messages.length > 0 || sending) && (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20 mb-6">
                      <span className="text-white text-[10px] font-bold">AI</span>
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[78%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`px-5 py-3.5 rounded-3xl text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 rounded-br-md'
                          : 'bg-[#161616] text-white border border-cyan-500/10 rounded-bl-md'
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-2 ml-1">
                        <button className="p-1.5 hover:bg-white/8 rounded-lg transition-colors group">
                          <Copy className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                        </button>
                        <button className="p-1.5 hover:bg-white/8 rounded-lg transition-colors group">
                          <ThumbsUp className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                        </button>
                        <button className="p-1.5 hover:bg-white/8 rounded-lg transition-colors group">
                          <Volume2 className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                        </button>
                        <button className="p-1.5 hover:bg-white/8 rounded-lg transition-colors group">
                          <RefreshCw className="w-4 h-4 text-slate-500 group-hover:text-slate-300" />
                        </button>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 border border-white/10 flex items-center justify-center flex-shrink-0 mb-1">
                      <span className="text-white text-xs font-semibold">{userInitial}</span>
                    </div>
                  )}
                </div>
              ))}

              {sending && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                    <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                  </div>
                  <div className="bg-[#161616] border border-cyan-500/10 rounded-3xl rounded-bl-md px-5 py-4">
                    <div className="flex gap-1.5 items-center">
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input bar */}
        <div className="px-4 pt-3 pb-5 bg-[#0d0d0d] border-t border-white/5">
          <div className="flex items-end gap-2">
            <button className="p-2.5 rounded-full hover:bg-white/8 transition-colors flex-shrink-0 mb-1">
              <Plus className="w-5 h-5 text-slate-400" />
            </button>

            <div className="flex-1 bg-[#1c1c1e] border border-white/8 rounded-3xl px-4 py-3 focus-within:border-cyan-500/40 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={e => { setInputValue(e.target.value); autoResize(); }}
                onKeyDown={handleKeyDown}
                placeholder={tr('Send message...', 'Enviar mensaje...')}
                disabled={sending}
                rows={1}
                className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none resize-none disabled:opacity-50 leading-relaxed"
                style={{ maxHeight: '120px' }}
              />
            </div>

            <button className="p-2.5 rounded-full hover:bg-white/8 transition-colors flex-shrink-0 mb-1">
              <Mic className="w-5 h-5 text-slate-400" />
            </button>

            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || sending}
              className="p-2.5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 shadow-lg shadow-blue-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0 mb-1"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center justify-center mt-3 gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          </div>
        </div>

      </div>
    </div>
  );
}
