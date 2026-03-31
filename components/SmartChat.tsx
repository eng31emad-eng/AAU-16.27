'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  suggestions?: string[];
  confidence?: number;
  sources?: Array<{
    sourceName: string;
    sourceUrl?: string;
    excerpt: string;
    chunkId: string;
  }>;
  traceId?: string;
  intent?: string;
  rewrittenQuestion?: string;
  feedback?: 'up' | 'down';
  errorCode?: string;
  retryAfterSeconds?: number;
};

const RobotFace = ({ small = false }: { small?: boolean }) => {
  return (
    <div className={`relative ${small ? 'h-6 w-6' : 'h-8 w-8'}`} aria-hidden="true">
      <span
        className={`absolute left-1/2 top-[-5px] h-2.5 w-0.5 -translate-x-1/2 rounded-full bg-primary/70`}
      />
      <span
        className={`absolute left-1/2 top-[-8px] h-2 w-2 -translate-x-1/2 rounded-full border border-primary/30 bg-white/80`}
      />
      <div
        className={`relative h-full w-full overflow-hidden rounded-xl border border-primary/15 bg-gradient-to-b from-white/85 to-white/55 shadow-inner ${small ? 'rounded-lg' : ''}`}
      >
        <span className="absolute left-[22%] top-[34%] h-1.5 w-1.5 rounded-full bg-primary/85" />
        <span className="absolute right-[22%] top-[34%] h-1.5 w-1.5 rounded-full bg-primary/85" />
        <span className="absolute left-1/2 top-[57%] h-1 w-3 -translate-x-1/2 rounded-full bg-primary/65" />
        <span className="absolute left-1.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-secondary/70" />
        <span className="absolute right-1.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-secondary/70" />
      </div>
    </div>
  );
};

export const SmartChat = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ar';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestNotice, setRequestNotice] = useState<string | null>(null);
  const [role, setRole] = useState<'student' | 'doctor' | 'guest' | 'editor' | 'admin'>('guest');
  const { user } = useAuth();
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (user?.role === 'student') setRole('student');
    else if (user?.role === 'doctor') setRole('doctor');
    else if (user?.role === 'admin') setRole('admin');
    else setRole('guest');
  }, [user]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (overrideText?: string) => {
    const outboundText = typeof overrideText === 'string' ? overrideText.trim() : input.trim();
    if (!outboundText) return;

    const inferred = inferRoleFromText(outboundText);
    if (inferred && inferred !== role) {
      setRole(inferred);
      const sysMsg: Message = {
        id: String(Date.now() + 1),
        role: 'system',
        text: language === 'ar' ? `تم التعرف عليك كـ ${roleLabel(inferred)}` : `Detected as ${roleLabel(inferred)}`
      };
      setMessages((prev) => [...prev, sysMsg]);
    }

    const userMsg: Message = { id: String(Date.now()), role: 'user', text: outboundText };
    const historyPayload = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-10)
      .map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setRequestNotice(null);
    setLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 30000);
      const res = await fetch('/api/smartchat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMsg.text, history: historyPayload }),
        signal: controller.signal,
      });
      window.clearTimeout(timeoutId);

      const data = await res.json().catch(() => ({}));
      if (data?.errorCode === 'RATE_LIMIT' && typeof data?.retryAfterSeconds === 'number') {
        setRequestNotice(
          language === 'ar'
            ? `تم تجاوز الحد المسموح. حاول بعد ${data.retryAfterSeconds} ثانية.`
            : `Rate limit reached. Try again in ${data.retryAfterSeconds}s.`,
        );
      } else if (data?.errorCode === 'UPSTREAM_TIMEOUT') {
        setRequestNotice(
          language === 'ar'
            ? 'الخدمة الخارجية بطيئة حالياً وتم استخدام رد احتياطي.'
            : 'The upstream model timed out and a fallback response was used.',
        );
      }
      if (!res.ok || data?.error) {
        const reply: Message = {
          id: String(Date.now() + 1),
          role: 'assistant',
          text:
            language === 'ar'
              ? 'عذرًا، حدثت مشكلة مؤقتة. حاول مرة أخرى بعد قليل.'
              : 'A temporary issue occurred. Please try again shortly.'
        };
        setMessages((prev) => [...prev, reply]);
        return;
      }

      const reply: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text:
          typeof data?.answer === 'string' && data.answer.trim()
            ? data.answer.trim()
            : language === 'ar'
              ? 'لا أملك معلومة كافية من المصدر.'
              : 'I do not have enough information from the source.',
        suggestions: Array.isArray(data?.suggestions)
          ? data.suggestions.filter((s: unknown) => typeof s === 'string' && s.trim()).slice(0, 3)
          : [],
        confidence: typeof data?.confidence === 'number' ? data.confidence : undefined,
        sources: Array.isArray(data?.sources)
          ? data.sources
            .filter((s: unknown) => typeof s === 'object' && s !== null)
            .map((s: any) => ({
              sourceName: typeof s.sourceName === 'string' ? s.sourceName : 'Source',
              sourceUrl: typeof s.sourceUrl === 'string' ? s.sourceUrl : undefined,
              excerpt: typeof s.excerpt === 'string' ? s.excerpt : '',
              chunkId: typeof s.chunkId === 'string' ? s.chunkId : `chunk-${Math.random().toString(36).slice(2)}`
            }))
            .slice(0, 3)
          : [],
        traceId: typeof data?.traceId === 'string' ? data.traceId : undefined,
        intent: typeof data?.intent === 'string' ? data.intent : undefined,
        rewrittenQuestion: typeof data?.rewrittenQuestion === 'string' ? data.rewrittenQuestion : undefined,
        errorCode: typeof data?.errorCode === 'string' ? data.errorCode : undefined,
        retryAfterSeconds: typeof data?.retryAfterSeconds === 'number' ? data.retryAfterSeconds : undefined,
      };
      setMessages((prev) => [...prev, reply]);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        setRequestNotice(
          language === 'ar'
            ? 'انتهت مهلة الطلب. جرّب سؤالاً أقصر أو أعد المحاولة.'
            : 'Request timed out. Try a shorter question or retry.',
        );
      }
      const reply: Message = {
        id: String(Date.now() + 1),
        role: 'assistant',
        text:
          language === 'ar'
            ? 'لا أستطيع الرد الآن. حاول مرة أخرى.'
            : 'An error occurred while fetching the answer. Please try again.'
      };
      setMessages((prev) => [...prev, reply]);
    } finally {
      setLoading(false);
    }
  };

  const submitFeedback = async (messageId: string, value: 'up' | 'down') => {
    const target = messages.find((m) => m.id === messageId);
    if (!target || target.role !== 'assistant') return;

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback: value } : m))
    );

    try {
      await fetch('/api/smartchat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'answer_feedback',
          value,
          traceId: target.traceId,
          intent: target.intent,
          confidence: target.confidence,
          answer: target.text,
        }),
      });
    } catch {
      // Ignore feedback transport errors in UI.
    }
  };

  const askSuggestion = async (suggestion: string) => {
    try {
      await fetch('/api/smartchat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'suggestion_click', suggestion }),
      });
    } catch {
      // Ignore analytics transport errors.
    }
    await sendMessage(suggestion);
  };

  const inferRoleFromText = (text: string): 'student' | 'doctor' | 'editor' | 'admin' | 'guest' => {
    const tLower = text.toLowerCase();
    if (/\b(طالب|طالبة|الدراسة|مقرر|مشروع|تسجيل)\b/.test(tLower) || tLower.includes('طالب')) return 'student';
    if (/\b(دكتور|دكتورة|أستاذ|أستاذة)\b/.test(tLower) || tLower.includes('دكتور') || tLower.includes('أستاذ')) return 'doctor';
    if (/\b(محرر|تحرير|نشر|محتوى)\b/.test(tLower) || tLower.includes('محرر')) return 'editor';
    if (/\b(ادمن|مسؤول|admin|administrator|مدير)\b/.test(tLower) || tLower.includes('ادمن') || tLower.includes('مسؤول')) return 'admin';
    if (tLower.match(/\b(student|homework|course|enroll|degree)\b/)) return 'student';
    if (tLower.match(/\b(professor|doctor|faculty|lecturer)\b/)) return 'doctor';
    if (tLower.match(/\b(editor|content|publish)\b/)) return 'editor';
    if (tLower.match(/\b(admin|administrator|manager)\b/)) return 'admin';
    return 'guest';
  };

  const roleLabel = (r: string) => {
    if (r === 'student') return language === 'ar' ? 'طالب' : 'Student';
    if (r === 'doctor') return language === 'ar' ? 'دكتور' : 'Doctor';
    if (r === 'editor') return language === 'ar' ? 'محرر محتوى' : 'Editor';
    if (r === 'admin') return language === 'ar' ? 'ادمن' : 'Admin';
    return language === 'ar' ? 'زائر' : 'Guest';
  };

  const clearChat = () => {
    setMessages([]);
    setRequestNotice(null);
  };

  return (
    <>
      <div className="fixed z-50 bottom-8 right-6 md:right-8">
        <motion.button
          whileTap={{ scale: 0.97 }}
          whileHover={{ y: -2 }}
          animate={{ scale: [1, 1.01, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          className="group relative h-16 w-16 rounded-[1.35rem] border border-white/40 bg-gradient-to-br from-secondary/95 via-gold-light to-secondary/90 text-primary shadow-[0_18px_42px_-20px_hsl(var(--secondary)/0.75)] hover:shadow-[0_24px_52px_-22px_hsl(var(--secondary)/0.82)] ring-1 ring-black/10 flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setOpen((o) => !o)}
          aria-label={t('الدردشة الذكية', 'Smart Chat')}
          title={t('المساعد الذكي', 'Smart Assistant')}
        >
          <span className="pointer-events-none absolute inset-0 rounded-[1.35rem] border border-white/30" />
          <span className="pointer-events-none absolute inset-1 rounded-[1.1rem] bg-gradient-to-br from-white/45 via-white/10 to-transparent" />
          <span className="pointer-events-none absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full border border-white/40 bg-white/60 shadow-sm" />
          <div className="relative z-10 transition-transform duration-200 group-hover:scale-105">
            <RobotFace />
          </div>
        </motion.button>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 h-[100dvh] overflow-hidden rounded-none border border-secondary/18 bg-background/98 shadow-[0_32px_84px_-36px_hsl(var(--foreground)/0.32)] backdrop-blur-xl flex flex-col sm:bottom-24 sm:left-auto sm:right-6 sm:h-[560px] sm:w-[370px] md:w-[440px] sm:rounded-3xl"
        >
          <div className="relative flex items-center justify-between border-b border-secondary/15 bg-gradient-to-r from-white via-background to-secondary/8 px-4 py-4">
            <span className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-secondary/50 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/28 to-secondary/14 text-secondary shadow-[0_10px_18px_-14px_hsl(var(--secondary)/0.8)]">
                <span className="absolute inset-1 rounded-xl border border-white/35" />
                <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-white/45 bg-white/70" />
                <div className="relative z-10">
                  <RobotFace small />
                </div>
              </div>
              <div>
                <div className="inline-flex items-center rounded-full border border-secondary/35 bg-primary px-2.5 py-0.5 text-xs font-bold tracking-wide text-secondary shadow-sm">
                  {t('المساعد الذكي', 'Smart Assistant')}
                </div>
                <div className="text-[13px] text-muted-foreground/90">{t('نسعد بمساعدتك', 'Happy to help')}</div>
                {role !== 'guest' && (
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {role === 'student'
                      ? t('طالب', 'Student')
                      : role === 'doctor'
                        ? t('دكتور', 'Doctor')
                        : role === 'editor'
                          ? t('محرر محتوى', 'Editor')
                          : t('ادمن', 'Admin')}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearChat} className="rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-secondary/10 hover:text-secondary transition-colors">
                {t('مسح', 'Clear')}
              </button>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 hover:bg-muted/70 transition-colors duration-150">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 min-h-0 space-y-3.5 overflow-y-auto bg-gradient-to-b from-background via-background to-secondary/5 p-4 [-webkit-overflow-scrolling:touch]">
            {requestNotice && (
              <div className="rounded-lg border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                {requestNotice}
              </div>
            )}
            {messages.length === 0 && (
              <div className="mt-12 text-center text-[15px] leading-7 text-muted-foreground">
                {t('ابدأ المحادثة بطرح سؤال...', 'Start the conversation by asking a question...')}
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 8, scale: 0.99 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.16, ease: 'easeOut' }}
                  className={`max-w-[90%] whitespace-pre-wrap rounded-2xl border px-4 py-3 text-[15px] font-medium leading-7 ${isRtl ? 'text-right' : 'text-left'} ${m.role === 'user'
                    ? 'ml-auto border-secondary/40 bg-gradient-to-b from-secondary/40 to-secondary/30 text-primary shadow-[0_10px_20px_-16px_hsl(var(--secondary)/0.75)]'
                    : 'mr-auto border-border/45 bg-card/95 text-foreground shadow-[0_10px_18px_-18px_hsl(var(--foreground)/0.28)]'
                    }`}
                >
                  <div>{m.text}</div>
                  {m.role === 'assistant' && Array.isArray(m.suggestions) && m.suggestions.length > 0 && (
                    <div className={`mt-2.5 flex flex-wrap gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={`${m.id}-s-${idx}`}
                          onClick={() => askSuggestion(s)}
                          className="rounded-full border border-border/60 bg-background px-3 py-1 text-xs text-muted-foreground hover:border-secondary/50 hover:text-foreground transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                  {m.role === 'assistant' && typeof m.confidence === 'number' && (
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      {language === 'ar' ? 'الثقة:' : 'Confidence:'} {(m.confidence * 100).toFixed(0)}%
                    </div>
                  )}
                  {m.role === 'assistant' && Array.isArray(m.sources) && m.sources.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {m.sources.map((src, idx) => (
                        <div key={`${m.id}-src-${src.chunkId}-${idx}`} className="rounded-lg border border-border/40 bg-background/80 p-2 text-xs leading-5">
                          <div className="font-semibold text-foreground">{src.sourceName}</div>
                          {src.excerpt && <div className="text-muted-foreground mt-1 whitespace-pre-wrap">{src.excerpt}</div>}
                          {src.sourceUrl && (
                            <a
                              href={src.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-1 inline-block text-secondary hover:underline"
                            >
                              {language === 'ar' ? 'فتح المصدر' : 'Open source'}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.role === 'assistant' && (
                    <div className={`mt-2.5 flex items-center gap-2 ${isRtl ? 'justify-end' : 'justify-start'}`}>
                      <button
                        onClick={() => submitFeedback(m.id, 'up')}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${m.feedback === 'up' ? 'border-secondary/60 bg-secondary/15 text-foreground' : 'border-border/50 bg-background text-muted-foreground hover:text-foreground'}`}
                      >
                        <ThumbsUp className="h-3.5 w-3.5" />
                        {language === 'ar' ? 'مفيد' : 'Helpful'}
                      </button>
                      <button
                        onClick={() => submitFeedback(m.id, 'down')}
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors ${m.feedback === 'down' ? 'border-secondary/60 bg-secondary/15 text-foreground' : 'border-border/50 bg-background text-muted-foreground hover:text-foreground'}`}
                      >
                        <ThumbsDown className="h-3.5 w-3.5" />
                        {language === 'ar' ? 'غير مفيد' : 'Not helpful'}
                      </button>
                    </div>
                  )}
                  <div className={`mt-2 ${isRtl ? 'text-right' : 'text-left'}`}>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none shadow-sm ${m.role === 'user'
                        ? 'border border-secondary/40 bg-secondary/18 text-foreground'
                        : 'border border-border/40 bg-background text-muted-foreground'
                        }`}
                    >
                      {m.role === 'user' ? (language === 'ar' ? 'أنت' : 'You') : language === 'ar' ? 'المساعد' : 'Assistant'}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {loading && (
              <div className="mr-auto flex max-w-[85%] items-center gap-2 rounded-2xl border border-border/35 bg-card/95 p-3 text-sm text-muted-foreground">
                <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground animate-pulse" />
                {t('جاري تجهيز الرد...', 'Preparing response...')}
              </div>
            )}
          </div>

          <div className="border-t border-border/30 bg-background px-4 py-3 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center gap-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder={t('اكتب سؤالك هنا واضغط Enter...', 'Type your question and press Enter...')}
                className="max-h-24 flex-1 resize-none overflow-y-auto rounded-xl border border-border/40 bg-card px-3.5 py-2.5 text-[15px] leading-7 text-foreground outline-none transition-colors placeholder:text-muted-foreground/80 focus:border-secondary/45 focus:bg-background"
              />
              <Button size="sm" onClick={sendMessage} disabled={loading || !input.trim()} className="flex items-center gap-2 rounded-xl bg-secondary px-3.5 text-secondary-foreground hover:bg-secondary/90 shadow-[0_12px_20px_-16px_hsl(var(--secondary)/0.95)] disabled:opacity-60">
                <Send className="w-4 h-4" />
                {t('إرسال', 'Send')}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default SmartChat;
