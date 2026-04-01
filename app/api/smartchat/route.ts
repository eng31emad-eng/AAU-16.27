import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { loadKbIndex, toSourceRef } from '@/lib/kb-loader';
import type { KbChunk, KbSourceRef, SmartChatStructuredResponse } from '@/types/kb';

export const runtime = 'nodejs';

const CANDIDATE_POOL = 24;
const TOP_K = 6;
const MIN_SIMILARITY = 0.31;
const KEYWORD_ONLY_MIN_SCORE = 0.2;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_MAX_ITEMS = Number(process.env.SMARTCHAT_CACHE_MAX_ITEMS || 600);
const GEMINI_TIMEOUT_MS = Number(process.env.SMARTCHAT_GEMINI_TIMEOUT_MS || 15000);
const CIRCUIT_BREAKER_FAILURE_THRESHOLD = Number(process.env.SMARTCHAT_CIRCUIT_FAIL_THRESHOLD || 4);
const CIRCUIT_BREAKER_OPEN_MS = Number(process.env.SMARTCHAT_CIRCUIT_OPEN_MS || 90 * 1000);
const EMBEDDING_MODEL = process.env.GEMINI_EMBEDDING_MODEL || 'gemini-embedding-001';
const GENERATION_MODELS = (
  process.env.GEMINI_GENERATION_MODELS ||
  'gemini-2.5-flash,gemini-flash-lite-latest,gemini-2.0-flash'
)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const MAX_RETRIES = 2;
const ENABLE_LLM_INTENT_REWRITE = (process.env.SMARTCHAT_ENABLE_LLM_INTENT_REWRITE || '1') !== '0';
const STRICT_FAQ_MATCH_MODE = (process.env.SMARTCHAT_STRICT_FAQ_MATCH_MODE || '0') !== '0';
const MIN_EXACT_QUESTION_SCORE = Number(process.env.SMARTCHAT_MIN_EXACT_QUESTION_SCORE || 0.65);
const EARLY_TURN_MAX_USER_MESSAGES = Number(process.env.SMARTCHAT_EARLY_TURN_MAX_USER_MESSAGES || 1);
const EARLY_TURN_MIN_TOP_SCORE = Number(process.env.SMARTCHAT_EARLY_TURN_MIN_TOP_SCORE || 0.30);
const EARLY_TURN_MIN_SEMANTIC_SCORE = Number(process.env.SMARTCHAT_EARLY_TURN_MIN_SEMANTIC_SCORE || 0.34);
const EARLY_TURN_MIN_KEYWORD_SCORE = Number(process.env.SMARTCHAT_EARLY_TURN_MIN_KEYWORD_SCORE || 0.24);
const EARLY_TURN_MIN_GAP = Number(process.env.SMARTCHAT_EARLY_TURN_MIN_GAP || 0.015);
const MIN_TOP_GAP = Number(process.env.SMARTCHAT_MIN_TOP_GAP || 0.015);
const CONTACT_LOCATION_MIN_TOP_SCORE = Number(process.env.SMARTCHAT_CONTACT_LOCATION_MIN_TOP_SCORE || 0.26);
const CONTACT_LOCATION_MIN_SEMANTIC_SCORE = Number(process.env.SMARTCHAT_CONTACT_LOCATION_MIN_SEMANTIC_SCORE || 0.24);
const CONTACT_LOCATION_MIN_KEYWORD_SCORE = Number(process.env.SMARTCHAT_CONTACT_LOCATION_MIN_KEYWORD_SCORE || 0.20);

const EMPTY_QUESTION_MESSAGE = 'اكتب سؤالك من فضلك.';
const NO_INFO_MESSAGE = 'حاليًا لا أجد إجابة مباشرة لهذا السؤال ضمن بيانات الجامعة المتاحة لدي.';
const OUTSIDE_MESSAGE = 'أعتذر، أنا مساعد مخصص لأسئلة جامعة الجيل الجديد فقط.';
const GENERIC_ERROR_MESSAGE = 'حدث خلل مؤقت. حاول مرة أخرى بعد قليل.';
const RATE_LIMIT_MESSAGE = 'الرجاء الانتظار قليلًا قبل إرسال سؤال جديد.';
const UNIVERSITY_NAME = 'جامعة الجيل الجديد';

type QuestionType = 'small_talk' | 'university' | 'outside';
type IntentType =
  | 'small_talk'
  | 'outside_scope'
  | 'admission_requirements'
  | 'tuition_fees'
  | 'scholarships'
  | 'program_info'
  | 'schedule_calendar'
  | 'policies_regulations'
  | 'campus_services'
  | 'contact_location'
  | 'general_university';

type IndexItem = KbChunk;
type IndexFile = {
  createdAt: string;
  count: number;
  model: string;
  items: IndexItem[];
};

type ChatHistoryItem = {
  role?: 'user' | 'assistant' | 'system';
  text?: string;
};

type IntentProfile = {
  intent: IntentType;
  type: QuestionType;
  intentTerms: string[];
  outside: boolean;
  smallTalk: boolean;
};

type SearchMatch = IndexItem & {
  semanticScore: number;
  keywordScore: number;
  phraseScore: number;
  intentScore: number;
  finalScore: number;
  rrfScore: number;
  rerankScore: number;
  questionMatchScore: number;
};

type CachedAnswer = {
  answer: string;
  confidence: number;
  sources: KbSourceRef[];
  suggestions: string[];
  type: QuestionType;
  intent: IntentType;
  rewrittenQuestion?: string;
  degraded?: boolean;
  expiresAt: number;
};

type UpstreamErrorType = 'timeout' | 'http' | 'network';
type LlmIntentLabel = 'small_talk' | 'university_domain' | 'clearly_outside';
type UpstreamResult = {
  status: number;
  data: any | null;
  errorText?: string;
  errorType?: UpstreamErrorType;
};

type CircuitBreakerState = {
  failures: number;
  openUntil: number;
};

const rateLimitStore = new Map<string, number[]>();
const answerCache = new Map<string, CachedAnswer>();
const inFlightAnswers = new Map<string, Promise<Omit<SmartChatStructuredResponse, 'traceId'>>>();
const geminiCircuitBreaker: CircuitBreakerState = { failures: 0, openUntil: 0 };

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pruneAnswerCache() {
  const now = Date.now();
  for (const [key, value] of answerCache.entries()) {
    if (value.expiresAt <= now) {
      answerCache.delete(key);
    }
  }
  while (answerCache.size > CACHE_MAX_ITEMS) {
    const oldestKey = answerCache.keys().next().value;
    if (!oldestKey) break;
    answerCache.delete(oldestKey);
  }
}

function isGeminiCircuitOpen() {
  return geminiCircuitBreaker.openUntil > Date.now();
}

function recordGeminiSuccess() {
  geminiCircuitBreaker.failures = 0;
  geminiCircuitBreaker.openUntil = 0;
}

function recordGeminiFailure() {
  geminiCircuitBreaker.failures += 1;
  if (geminiCircuitBreaker.failures >= CIRCUIT_BREAKER_FAILURE_THRESHOLD) {
    geminiCircuitBreaker.openUntil = Date.now() + CIRCUIT_BREAKER_OPEN_MS;
  }
}

function normalizeArabic(text: string) {
  return text
    .normalize('NFKC')
    .replace(/[\u064B-\u0652\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ـ+/g, '')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeQuestion(question: string) {
  let q = question;
  const slangMap: Array<[RegExp, string]> = [
    [/\bفين\b/gi, 'اين'],
    [/\bوين\b/gi, 'اين'],
    [/\bايش\b/gi, 'ما'],
    [/\bاش\b/gi, 'ما'],
    [/\bشلون\b/gi, 'كيف'],
    [/\bقديش\b/gi, 'كم'],
  ];
  for (const [pattern, replacement] of slangMap) {
    q = q.replace(pattern, replacement);
  }
  return normalizeArabic(q);
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function getKeywordScore(normalizedQuery: string, normalizedText: string) {
  const qWords = normalizedQuery.split(' ').filter(Boolean);
  if (qWords.length === 0) return 0;
  const textWords = new Set(normalizedText.split(' ').filter(Boolean));
  let overlap = 0;
  for (const word of qWords) {
    if (textWords.has(word)) overlap += 1;
  }
  return overlap / qWords.length;
}

function getPhraseScore(normalizedQuery: string, normalizedQuestionText: string, normalizedAnswerText: string) {
  if (!normalizedQuery) return 0;
  if (normalizedQuestionText.includes(normalizedQuery)) return 1;
  if (normalizedAnswerText.includes(normalizedQuery)) return 0.8;
  return 0;
}

function getQuestionMatchScore(normalizedQuery: string, normalizedQuestionText: string) {
  if (!normalizedQuery || !normalizedQuestionText) return 0;

  if (normalizedQuery === normalizedQuestionText) return 1;
  const keyword = getKeywordScore(normalizedQuery, normalizedQuestionText);
  const startsOrContains =
    normalizedQuestionText.startsWith(normalizedQuery) ||
    normalizedQuery.startsWith(normalizedQuestionText) ||
    normalizedQuestionText.includes(normalizedQuery) ||
    normalizedQuery.includes(normalizedQuestionText)
      ? 1
      : 0;

  return Number((keyword * 0.7 + startsOrContains * 0.3).toFixed(3));
}

function includesAny(text: string, terms: string[]) {
  return terms.some((t) => text.includes(t));
}

function hasAnyPattern(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

const SMALL_TALK_TERMS = [
  'السلام عليكم',
  'السلام',
  'مرحبا',
  'اهلا',
  'اهلين',
  'صباح الخير',
  'مساء الخير',
  'من انت',
  'ما اسمك',
  'ساعدني',
  'hello',
  'hi',
  'help',
].map((term) => normalizeQuestion(term));

const OUTSIDE_STRONG_TERMS = [
  'الطقس',
  'درجه الحراره',
  'مباراه',
  'كره القدم',
  'الدوري',
  'اسهم',
  'بيتكوين',
  'عمله رقميه',
  'سياره',
  'طبخ',
  'وصفه',
  'فيلم',
  'مسلسل',
  'اغنيه',
  'الهاتف',
  'جوال',
  'برمجه',
  'ذكاء اصطناعي',
  'الساعه',
  'وقت',
  'رحله',
  'حجز طيران',
].map((term) => normalizeQuestion(term));

const UNIVERSITY_ANCHOR_TERMS = [
  'جامعه',
  'الجامعه',
  'الجيل الجديد',
  'قبول',
  'تسجيل',
  'تخصص',
  'برامج',
  'كليه',
  'رسوم',
  'اقساط',
  'منح',
  'سكن',
  'دوام',
  'تقويم',
  'اختبار',
  'عنوان',
  'موقع',
  'تواصل',
  'هاتف',
  'ايميل',
  'university',
  'campus',
  'aau',
].map((term) => normalizeQuestion(term));

const GENERAL_UNIVERSITY_SHORT_TERMS = [
  'اين',
  'وين',
  'موقع',
  'عنوان',
  'كم',
  'رسوم',
  'اقساط',
  'ما',
  'ايش',
  'تخصصات',
  'برامج',
  'كليات',
  'كيف',
  'اسجل',
  'تسجيل',
  'قبول',
  'شروط',
  'دوام',
  'منح',
  'منحه',
  'تواصل',
].map((term) => normalizeQuestion(term));

const UNIVERSITY_SYNONYM_MAP: Array<[RegExp, string]> = [
  [/\bموقعكم\b/giu, 'موقع الجامعة'],
  [/\bرسومكم\b/giu, 'رسوم الجامعة'],
  [/\bتخصصاتكم\b/giu, 'تخصصات الجامعة'],
  [/\bعندكم\b/giu, 'لدى الجامعة'],
  [/\bجامعتكم\b/giu, 'جامعة الجيل الجديد'],
];

const INTENT_TERMS: Array<{ intent: IntentType; terms: string[] }> = [
  { intent: 'admission_requirements', terms: ['قبول', 'تسجيل', 'التسجيل', 'شروط', 'وثائق', 'معدل', 'admission', 'register'] },
  { intent: 'tuition_fees', terms: ['رسوم', 'اقساط', 'قسط', 'تكلفه', 'سعر', 'fees', 'tuition'] },
  { intent: 'scholarships', terms: ['منحه', 'منح', 'خصم', 'اعفاء', 'scholarship'] },
  { intent: 'program_info', terms: ['تخصص', 'برنامج', 'برامج', 'كليه', 'الكليات', 'major', 'program', 'college'] },
  { intent: 'schedule_calendar', terms: ['دوام', 'جدول', 'تقويم', 'اختبار', 'بدايه', 'نهايه', 'calendar', 'schedule', 'exam'] },
  { intent: 'policies_regulations', terms: ['لائحه', 'قانون', 'سياسه', 'انذار', 'غياب', 'حضور', 'policy', 'regulation'] },
  { intent: 'campus_services', terms: ['مكتبه', 'سكن', 'مختبر', 'نقل', 'انترنت', 'خدمات', 'library', 'lab', 'service'] },
  { intent: 'contact_location', terms: ['اين', 'عنوان', 'موقع', 'تواصل', 'هاتف', 'ايميل', 'location', 'address', 'contact'] },
];

function applySynonymExpansion(question: string) {
  const raw = String(question || '').trim();
  if (!raw) return raw;

  const rawNormalized = normalizeQuestion(raw);
  let expanded = raw;

  for (const [pattern, replacement] of UNIVERSITY_SYNONYM_MAP) {
    expanded = expanded.replace(pattern, replacement);
  }

  const expansions: string[] = [];
  if (rawNormalized.includes(normalizeQuestion('موقعكم'))) expansions.push('موقع الجامعة');
  if (rawNormalized.includes(normalizeQuestion('رسومكم'))) expansions.push('رسوم الجامعة');
  if (rawNormalized.includes(normalizeQuestion('تخصصاتكم'))) expansions.push('تخصصات الجامعة');
  if (rawNormalized.includes(normalizeQuestion('عندكم'))) expansions.push('لدى الجامعة');

  if (expansions.length > 0) {
    expanded = `${expanded} ${expansions.join(' ')}`.trim();
  }

  return expanded;
}

function rewriteUniversityScopedQuestion(question: string) {
  const raw = String(question || '').trim();
  if (!raw) return raw;

  const normalized = normalizeQuestion(raw);

  const rewriteRules: Array<{ patterns: RegExp[]; target: string }> = [
    {
      patterns: [/^(اين|وين)\s+(موقع|عنوان)/i, /^(اين|وين)\s+موقعكم/i, /^(what|where).*(location|address)/i],
      target: `اين موقع ${UNIVERSITY_NAME}؟`,
    },
    {
      patterns: [/^(كم|ما)\s+(ال)?(رسوم|الاقساط|القسط)/i, /^(كم|ما)\s+رسومكم/i, /^(how much).*(fees|tuition)/i],
      target: `ما رسوم الدراسة في ${UNIVERSITY_NAME}؟`,
    },
    {
      patterns: [/^(ما|ايش|ما هي)\s+(ال)?(تخصصات|البرامج|الكليات)/i, /^(ما|ايش)\s+تخصصاتكم/i, /^(what).*(majors|programs|specializations)/i],
      target: `ما التخصصات المتاحة في ${UNIVERSITY_NAME}؟`,
    },
    {
      patterns: [/^(كيف|شلون|ايش)\s+(اسجل|التسجيل|انضم|اقدم)/i, /^(how).*(register|apply|admission)/i],
      target: `كيف أسجل في ${UNIVERSITY_NAME}؟`,
    },
  ];

  for (const rule of rewriteRules) {
    if (hasAnyPattern(raw, rule.patterns) || hasAnyPattern(normalized, rule.patterns)) {
      return rule.target;
    }
  }

  const hasUniversityReference = includesAny(normalized, UNIVERSITY_ANCHOR_TERMS);
  const words = normalized.split(' ').filter(Boolean);
  const isShortQuestion = words.length <= 5;
  const looksQuestion = includesAny(normalized, GENERAL_UNIVERSITY_SHORT_TERMS);

  if (!hasUniversityReference && isShortQuestion && looksQuestion) {
    return `${raw} في ${UNIVERSITY_NAME}`;
  }

  return raw;
}

function classifyIntent(question: string): IntentProfile {
  const q = normalizeQuestion(question);
  const words = q.split(' ').filter(Boolean);

  if (includesAny(q, SMALL_TALK_TERMS) || /(hi|hello|who are you|help)/i.test(question)) {
    return { intent: 'small_talk', type: 'small_talk', intentTerms: [], outside: false, smallTalk: true };
  }

  const hasUniversityAnchor = includesAny(q, UNIVERSITY_ANCHOR_TERMS) || /(admission|tuition|college|program|university|campus|fees)/i.test(question);
  const isGeneralShortUniversityQuestion = words.length <= 5 && includesAny(q, GENERAL_UNIVERSITY_SHORT_TERMS);
  const clearlyOutside = includesAny(q, OUTSIDE_STRONG_TERMS) || /(weather|temperature|football|soccer|stock|bitcoin|recipe|movie|song|car|phone|travel)/i.test(question);

  if (clearlyOutside && !hasUniversityAnchor && !isGeneralShortUniversityQuestion) {
    return { intent: 'outside_scope', type: 'outside', intentTerms: [], outside: true, smallTalk: false };
  }

  if (hasUniversityAnchor || isGeneralShortUniversityQuestion || words.length <= 3) {
    for (const rule of INTENT_TERMS) {
      const normalizedTerms = rule.terms.map((term) => normalizeQuestion(term));
      if (includesAny(q, normalizedTerms)) {
        return { intent: rule.intent, type: 'university', intentTerms: normalizedTerms, outside: false, smallTalk: false };
      }
    }
    return { intent: 'general_university', type: 'university', intentTerms: [], outside: false, smallTalk: false };
  }

  for (const rule of INTENT_TERMS) {
    const normalizedTerms = rule.terms.map((term) => normalizeQuestion(term));
    if (includesAny(q, normalizedTerms)) {
      return { intent: rule.intent, type: 'university', intentTerms: normalizedTerms, outside: false, smallTalk: false };
    }
  }

  return { intent: 'general_university', type: 'university', intentTerms: [], outside: false, smallTalk: false };
}

function rewriteQuestionFromHistory(question: string, history: ChatHistoryItem[]) {
  const cleanedQuestion = String(question || '').trim();
  if (!cleanedQuestion) return { rewrittenQuestion: '', rewritten: false };

  const cleanedHistory = Array.isArray(history)
    ? history
      .map((h) => ({ role: h?.role, text: String(h?.text || '').trim() }))
      .filter((h) => h.text)
    : [];

  const previousUser = [...cleanedHistory].reverse().find((h) => h.role === 'user')?.text || '';
  const previousAssistant = [...cleanedHistory].reverse().find((h) => h.role === 'assistant')?.text || '';
  const normalized = normalizeQuestion(cleanedQuestion);
  const words = normalized.split(' ').filter(Boolean);
  const followUp = /^(و|طيب|طب|اذن|اذا|وماذا|وهل|وكيف|ومتى|كم|what about|and )/i.test(cleanedQuestion.trim());
  const pronounLike = includesAny(normalized, ['هذا', 'هذه', 'ذلك', 'الذي', 'التي', 'هذي', 'ذا']);

  if ((followUp || pronounLike) && previousUser) {
    const merged = `${previousUser} | ${cleanedQuestion}`;
    return { rewrittenQuestion: merged, rewritten: true };
  }

  if ((followUp || pronounLike) && previousAssistant) {
    const merged = `${previousAssistant.slice(0, 160)} | ${cleanedQuestion}`;
    return { rewrittenQuestion: merged, rewritten: true };
  }

  return { rewrittenQuestion: cleanedQuestion, rewritten: false };
}

function applyIntentFilter(items: IndexItem[], intentProfile: IntentProfile) {
  if (intentProfile.intentTerms.length === 0) return items;

  const filtered = items.filter((item) => {
    const meta = item.metadata || {};
    const tags = Array.isArray(meta.tags) ? meta.tags.join(' ') : '';
    const corpus = normalizeQuestion(`${item.question} ${item.answer} ${tags}`);
    return intentProfile.intentTerms.some((term) => corpus.includes(normalizeQuestion(term)));
  });

  if (filtered.length < 8) return items;
  return filtered;
}

function countUserTurns(history: ChatHistoryItem[]) {
  if (!Array.isArray(history)) return 0;
  return history
    .filter((item) => item?.role === 'user' && String(item?.text || '').trim().length > 0)
    .length;
}

function reciprocalRankFusion(index: number, k = 60) {
  return 1 / (k + index + 1);
}

function hybridRetrieve(
  questionEmbedding: number[] | null,
  normalizedQuestion: string,
  items: IndexItem[],
  useSemanticSearch: boolean,
  intentProfile: IntentProfile,
) {
  const scoped = applyIntentFilter(items, intentProfile);
  const base: SearchMatch[] = scoped.map((item) => {
    const normalizedItemQ = normalizeQuestion(item.question);
    const normalizedItemA = normalizeQuestion(item.answer);
    const semanticScore =
      useSemanticSearch && questionEmbedding && Array.isArray(item.embedding) && item.embedding.length > 0
        ? cosineSimilarity(questionEmbedding, item.embedding)
        : 0;
    const keywordQuestion = getKeywordScore(normalizedQuestion, normalizedItemQ);
    const keywordAnswer = getKeywordScore(normalizedQuestion, normalizedItemA);
    const keywordScore = keywordQuestion * 0.7 + keywordAnswer * 0.3;
    const phraseScore = getPhraseScore(normalizedQuestion, normalizedItemQ, normalizedItemA);
    const questionMatchScore = getQuestionMatchScore(normalizedQuestion, normalizedItemQ);
    const intentScore = intentProfile.intentTerms.length
      ? (includesAny(`${normalizedItemQ} ${normalizedItemA}`, intentProfile.intentTerms.map((x) => normalizeQuestion(x))) ? 0.1 : 0)
      : 0;

    const finalScore = useSemanticSearch
      ? semanticScore * 0.64 + keywordScore * 0.26 + phraseScore * 0.07 + questionMatchScore * 0.02 + intentScore * 0.01
      : keywordScore * 0.77 + phraseScore * 0.17 + questionMatchScore * 0.03 + intentScore * 0.03;

    return {
      ...item,
      semanticScore,
      keywordScore,
      phraseScore,
      intentScore,
      finalScore,
      rrfScore: 0,
      rerankScore: 0,
      questionMatchScore,
    };
  });

  const semanticRank = [...base].sort((a, b) => b.semanticScore - a.semanticScore).slice(0, CANDIDATE_POOL);
  const keywordRank = [...base].sort((a, b) => b.keywordScore - a.keywordScore).slice(0, CANDIDATE_POOL);
  const finalRank = [...base].sort((a, b) => b.finalScore - a.finalScore).slice(0, CANDIDATE_POOL);

  const union = new Map<string, SearchMatch>();
  const ingestRank = (ranked: SearchMatch[], key: 'semantic' | 'keyword' | 'final') => {
    ranked.forEach((item, idx) => {
      const id = String(item.id);
      const current = union.get(id) || { ...item };
      const add = reciprocalRankFusion(idx);
      if (key === 'semantic') current.rrfScore += add;
      if (key === 'keyword') current.rrfScore += add;
      if (key === 'final') current.rrfScore += add;
      union.set(id, current);
    });
  };

  ingestRank(semanticRank, 'semantic');
  ingestRank(keywordRank, 'keyword');
  ingestRank(finalRank, 'final');

  const reranked = [...union.values()]
    .map((item) => ({
      ...item,
      rerankScore: item.finalScore * 0.8 + item.rrfScore * 0.18 + item.questionMatchScore * 0.02,
    }))
    .sort((a, b) => b.rerankScore - a.rerankScore)
    .slice(0, TOP_K);

  return reranked;
}

function clampConfidence(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function deriveConfidence(score: number, useSemanticSearch: boolean) {
  const normalized = useSemanticSearch ? score : score * 1.6;
  return Number(clampConfidence(normalized).toFixed(2));
}

function calibrateConfidence(
  baseConfidence: number,
  topMatches: SearchMatch[],
  intent: IntentType
) {
  const top = topMatches[0]?.rerankScore ?? 0;
  const second = topMatches[1]?.rerankScore ?? 0;
  const gap = Math.max(0, top - second);

  let calibrated = baseConfidence;
  if (gap >= 0.12) calibrated += 0.08;
  if (gap <= 0.04) calibrated -= 0.06;
  if (intent === 'general_university') calibrated -= 0.04;
  if (intent === 'small_talk') calibrated = 1;

  return Number(clampConfidence(calibrated).toFixed(2));
}


function buildSourceRef(match: SearchMatch, rank: number): KbSourceRef {
  const metadata = match.metadata || {};
  const sourceName = typeof metadata.sourceName === 'string' && metadata.sourceName.trim()
    ? metadata.sourceName
    : `FAQ #${rank + 1}`;
  const sourceUrl = typeof metadata.sourceUrl === 'string' && metadata.sourceUrl.trim()
    ? metadata.sourceUrl
    : undefined;
  const excerpt = typeof metadata.excerpt === 'string' && metadata.excerpt.trim()
    ? metadata.excerpt
    : match.answer.length > 180 ? `${match.answer.slice(0, 180)}...` : match.answer;

  return {
    ...toSourceRef(match.question, match.answer, match.id, rank),
    sourceName,
    sourceUrl,
    excerpt,
  };
}

function getSmallTalkReply(question: string) {
  const q = normalizeQuestion(question);
  if (includesAny(q, ['السلام عليكم', 'السلام', 'مرحبا', 'اهلا']) || /(hi|hello)/i.test(q)) {
    return 'وعليكم السلام، أهلًا بك. أنا مساعد الجامعة.';
  }
  if (includesAny(q, ['ما اسمك', 'من انت']) || /(who are you|your name)/i.test(q)) {
    return 'أنا المساعد الذكي لجامعة الجيل الجديد.';
  }
  return 'مرحبًا بك، اسألني عن القبول، الرسوم، البرامج، والخدمات الجامعية.';
}

function getLowSimilarityReply(suggestions: string[]) {
  const top2 = suggestions.filter(Boolean).slice(0, 2);
  if (top2.length === 0) return NO_INFO_MESSAGE;
  return `${NO_INFO_MESSAGE} ربما تقصد: ${top2.join('، ')}`;
}

async function postJsonWithRetry(url: string, body: unknown, retries = MAX_RETRIES): Promise<UpstreamResult> {
  let last: { status: number; message: string; type: UpstreamErrorType } | null = null;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      if (response.ok) return { status: response.status, data: await response.json() };
      const errText = await response.text();
      last = { status: response.status, message: errText, type: 'http' };
      const canRetry = response.status === 429 || response.status >= 500;
      if (!canRetry || attempt === retries) break;
      await sleep(1200 * (attempt + 1));
    } catch (error: unknown) {
      clearTimeout(timeout);
      const isAbort = error instanceof Error && error.name === 'AbortError';
      last = {
        status: isAbort ? 504 : 503,
        message: error instanceof Error ? error.message : 'Network failure',
        type: isAbort ? 'timeout' : 'network',
      };
      if (attempt === retries) break;
      await sleep(1200 * (attempt + 1));
    }
  }
  return {
    status: last?.status || 500,
    data: null,
    errorText: last?.message || 'Unknown error',
    errorType: last?.type || 'http',
  };
}

async function embedTextGemini(apiKey: string, text: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`;
  const result = await postJsonWithRetry(url, { content: { parts: [{ text }] } });
  if (!result.data) throw new Error(`Gemini embedding request failed (${result.status}): ${result.errorText}`);
  const values = result.data?.embedding?.values;
  if (!Array.isArray(values) || values.length === 0) throw new Error('Gemini embedding response is invalid.');
  return values as number[];
}

async function tryGenerateWithModel(apiKey: string, model: string, prompt: string) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const result = await postJsonWithRetry(url, {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2 },
  });
  if (!result.data) {
    return {
      ok: false,
      status: result.status,
      errorText: result.errorText,
      errorType: result.errorType,
    };
  }
  const text = result.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  return { ok: true, text: text || '' };
}

function buildIntentRewritePrompt(question: string, history: ChatHistoryItem[]) {
  const safeHistory = Array.isArray(history)
    ? history
      .slice(-6)
      .map((item) => `${item.role || 'user'}: ${String(item.text || '').trim()}`)
      .filter(Boolean)
      .join('\n')
    : '';

  return [
    'أنت مصنف نوايا ومُعيد صياغة لاستعلامات شات جامعة.',
    `اسم الجامعة الرسمي: ${UNIVERSITY_NAME}.`,
    'قاعدة أساسية: الشات داخل موقع الجامعة، لذلك أي سؤال عام قصير يُفترض أنه عن الجامعة ما لم يكن خارج الموضوع بوضوح.',
    'صنف السؤال إلى قيمة واحدة فقط:',
    '- small_talk',
    '- university_domain',
    '- clearly_outside',
    'ثم أعد كتابة السؤال بشكل واضح ومباشر عن الجامعة.',
    'ممنوع اختراع معلومات. المطلوب فقط تصنيف + إعادة صياغة.',
    'أعد JSON فقط بدون أي نص إضافي بهذا الشكل:',
    '{"intent":"university_domain","rewrittenQuestion":"..."}',
    '',
    `السؤال الحالي: ${question}`,
    safeHistory ? `السياق السابق:\n${safeHistory}` : 'السياق السابق: لا يوجد',
  ].join('\n');
}

function parseJsonObject(raw: string) {
  const text = String(raw || '').trim();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

async function classifyAndRewriteWithGemini(apiKey: string, question: string, history: ChatHistoryItem[]) {
  if (!apiKey || !ENABLE_LLM_INTENT_REWRITE || GENERATION_MODELS.length === 0) return null;

  const model = GENERATION_MODELS[0];
  const prompt = buildIntentRewritePrompt(question, history);
  const result = await tryGenerateWithModel(apiKey, model, prompt);
  if (!result.ok || !result.text) return null;

  const parsed = parseJsonObject(result.text) as { intent?: string; rewrittenQuestion?: string } | null;
  if (!parsed) return null;

  const intent = parsed.intent;
  const rewrittenQuestion = typeof parsed.rewrittenQuestion === 'string' ? parsed.rewrittenQuestion.trim() : '';

  if (intent !== 'small_talk' && intent !== 'university_domain' && intent !== 'clearly_outside') {
    return null;
  }

  return {
    intent: intent as LlmIntentLabel,
    rewrittenQuestion: rewrittenQuestion || question,
    usedModel: model,
  };
}

async function generateAnswerGemini(apiKey: string, question: string, topMatches: SearchMatch[]) {
  if (isGeminiCircuitOpen()) {
    return {
      answer: topMatches[0]?.answer || NO_INFO_MESSAGE,
      usedModel: 'circuit-open',
      degraded: true,
      errorType: 'network' as UpstreamErrorType,
    };
  }

  const context = topMatches.map((item, i) => `Q${i + 1}: ${item.question}\nA${i + 1}: ${item.answer}`).join('\n\n');
  const prompt = [
    'أنت مساعد رسمي لجامعة الجيل الجديد.',
    'التعليمات:',
    '- أجب باللغة العربية.',
    '- استخدم فقط المعلومات الموجودة في "المصدر".',
    '- ممنوع اختراع معلومات غير موجودة.',
    '- إذا كانت النتائج غير كافية أو متضاربة، أعد جملة عدم توفر المعلومات فقط.',
    `- إذا لم تتوفر إجابة واضحة، أعد هذه الجملة فقط: ${NO_INFO_MESSAGE}`,
    '',
    `السؤال:\n${question}`,
    '',
    `المصدر:\n${context}`,
  ].join('\n');

  let lastError = '';
  let lastErrorType: UpstreamErrorType | undefined;
  for (const model of GENERATION_MODELS) {
    const result = await tryGenerateWithModel(apiKey, model, prompt);
    if (result.ok && result.text) {
      recordGeminiSuccess();
      return { answer: result.text, usedModel: model, degraded: false };
    }
    lastError = `model=${model} status=${result.status} error=${result.errorText}`;
    lastErrorType = result.errorType;
  }
  recordGeminiFailure();
  console.error(`Gemini generation failed on all models. ${lastError}`);
  return {
    answer: topMatches[0]?.answer || NO_INFO_MESSAGE,
    usedModel: 'fallback',
    degraded: true,
    errorType: lastErrorType,
  };
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0]?.trim() || 'unknown';
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown';
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const recent = (rateLimitStore.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    rateLimitStore.set(ip, recent);
    const retryAfterMs = Math.max(1000, RATE_LIMIT_WINDOW_MS - (now - recent[0]));
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(retryAfterMs / 1000),
    };
  }
  recent.push(now);
  rateLimitStore.set(ip, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function POST(req: Request) {
  const startedAt = Date.now();
  const traceId = randomUUID();
  let usedLLM = 'none';
  let finalScoreLog = 0;
  let semanticScoreLog = 0;
  let questionMatchScoreLog = 0;

  const respond = (
    payload: Omit<SmartChatStructuredResponse, 'traceId'>,
    init?: { status?: number; headers?: Record<string, string> },
  ) => NextResponse.json({ ...payload, traceId }, init);

  try {
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return respond(
        {
        answer: RATE_LIMIT_MESSAGE,
        confidence: 0,
        sources: [],
        suggestions: [],
        type: 'outside',
        intent: 'outside_scope',
        errorCode: 'RATE_LIMIT',
        retryAfterSeconds: rateLimit.retryAfterSeconds,
      },
        {
          status: 429,
          headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) },
        }
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return respond({
        answer: EMPTY_QUESTION_MESSAGE,
        confidence: 0,
        sources: [],
        suggestions: [],
        type: 'small_talk',
        intent: 'small_talk',
      });
    }

    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const history: ChatHistoryItem[] = Array.isArray(body?.history) ? body.history : [];
    if (!question) {
      return respond({
        answer: EMPTY_QUESTION_MESSAGE,
        confidence: 0,
        sources: [],
        suggestions: [],
        type: 'small_talk',
        intent: 'small_talk',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY || '';
    const historyRewrite = rewriteQuestionFromHistory(question, history);
    const expandedQuestion = applySynonymExpansion(historyRewrite.rewrittenQuestion || question);
    let effectiveQuestion = rewriteUniversityScopedQuestion(expandedQuestion);
    let intentProfile = classifyIntent(effectiveQuestion);

    const isAmbiguousIntent = intentProfile.outside || intentProfile.intent === 'general_university';
    if (isAmbiguousIntent && apiKey && ENABLE_LLM_INTENT_REWRITE) {
      try {
        const llmIntentRewrite = await classifyAndRewriteWithGemini(apiKey, effectiveQuestion, history);
        if (llmIntentRewrite) {
          usedLLM = `intent-rewrite:${llmIntentRewrite.usedModel}`;
          effectiveQuestion = rewriteUniversityScopedQuestion(applySynonymExpansion(llmIntentRewrite.rewrittenQuestion));

          if (llmIntentRewrite.intent === 'small_talk') {
            intentProfile = { intent: 'small_talk', type: 'small_talk', intentTerms: [], outside: false, smallTalk: true };
          } else if (llmIntentRewrite.intent === 'clearly_outside') {
            intentProfile = { intent: 'outside_scope', type: 'outside', intentTerms: [], outside: true, smallTalk: false };
          } else {
            const refinedIntent = classifyIntent(effectiveQuestion);
            intentProfile = refinedIntent.outside
              ? { intent: 'general_university', type: 'university', intentTerms: [], outside: false, smallTalk: false }
              : refinedIntent;
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Intent rewrite failed';
        console.warn('[smartchat] intent rewrite fallback:', message);
      }
    }

    const normalizedQuestion = normalizeQuestion(effectiveQuestion);
    const wasRewritten = normalizeQuestion(question) !== normalizedQuestion;
    const cacheKey = `${intentProfile.intent}::${normalizedQuestion}`;

    const cached = answerCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      usedLLM = 'cache';
      return respond({
        answer: cached.answer,
        confidence: cached.confidence,
        sources: cached.sources,
        suggestions: cached.suggestions,
        type: cached.type,
        intent: cached.intent,
        rewrittenQuestion: cached.rewrittenQuestion,
        degraded: cached.degraded,
        cached: true,
      });
    }

    if (intentProfile.smallTalk) {
      return respond({
        answer: getSmallTalkReply(question),
        confidence: 1,
        sources: [],
        suggestions: [],
        type: 'small_talk',
        intent: 'small_talk',
      });
    }

    if (intentProfile.outside) {
      return respond({
        answer: OUTSIDE_MESSAGE,
        confidence: 1,
        sources: [],
        suggestions: [],
        type: 'outside',
        intent: 'outside_scope',
      });
    }

    const existingInFlight = inFlightAnswers.get(cacheKey);
    if (existingInFlight) {
      const inFlightPayload = await existingInFlight;
      usedLLM = 'in-flight-reuse';
      return respond({ ...inFlightPayload, cached: true });
    }

    const processingPromise = (async (): Promise<Omit<SmartChatStructuredResponse, 'traceId'>> => {
      const index = (await loadKbIndex()) as IndexFile;
      let useSemanticSearch = Boolean(apiKey) && index.model !== 'keyword-only';
      let degraded = false;
      let upstreamErrorType: UpstreamErrorType | undefined;

      let questionEmbedding: number[] | null = null;
      if (useSemanticSearch) {
        try {
          questionEmbedding = await embedTextGemini(apiKey as string, normalizedQuestion || question);
        } catch (error: unknown) {
          degraded = true;
          useSemanticSearch = false;
          usedLLM = 'embed-fallback-keyword';
          const message = error instanceof Error ? error.message : 'Embedding failed';
          if (/AbortError|timeout|504/i.test(message)) upstreamErrorType = 'timeout';
          else upstreamErrorType = 'network';
          recordGeminiFailure();
        }
      }

      const topMatches = hybridRetrieve(
        questionEmbedding,
        normalizedQuestion,
        index.items,
        useSemanticSearch,
        intentProfile,
      );

      const topScore = topMatches[0]?.rerankScore ?? 0;
      const topQuestionMatchScore = topMatches[0]?.questionMatchScore ?? 0;
      finalScoreLog = topScore;
      semanticScoreLog = topMatches[0]?.semanticScore ?? 0;
      questionMatchScoreLog = topQuestionMatchScore;
      const rawConfidence = deriveConfidence(topScore, useSemanticSearch);
      let confidence = calibrateConfidence(rawConfidence, topMatches, intentProfile.intent);
      const suggestions = topMatches.slice(0, 3).map((m) => m.question);
      const fallbackSuggestions = suggestions.slice(0, 2);
      const sources = topMatches.slice(0, 3).map((m, i) => buildSourceRef(m, i));

      const threshold = useSemanticSearch ? MIN_SIMILARITY : KEYWORD_ONLY_MIN_SCORE;
      const secondScore = topMatches[1]?.rerankScore ?? 0;
      const topSemanticScore = topMatches[0]?.semanticScore ?? 0;
      const topKeywordScore = topMatches[0]?.keywordScore ?? 0;
      const topGap = Math.max(0, topScore - secondScore);
      const userTurns = countUserTurns(history);
      const isEarlyTurn = userTurns <= EARLY_TURN_MAX_USER_MESSAGES;

      const weakByTopScore = topScore < (isEarlyTurn ? Math.max(threshold, EARLY_TURN_MIN_TOP_SCORE) : threshold);
      const weakBySemantic = useSemanticSearch && topSemanticScore < (isEarlyTurn ? EARLY_TURN_MIN_SEMANTIC_SCORE : MIN_SIMILARITY);
      const weakByKeyword = !useSemanticSearch && topKeywordScore < (isEarlyTurn ? EARLY_TURN_MIN_KEYWORD_SCORE : KEYWORD_ONLY_MIN_SCORE);
      const ambiguousTop =
        topGap < (isEarlyTurn ? EARLY_TURN_MIN_GAP : MIN_TOP_GAP) &&
        topScore < threshold + 0.06 &&
        topQuestionMatchScore < 0.55;

      const isContactLocationIntent = intentProfile.intent === 'contact_location';
      const hasReasonableContactSignal =
        topKeywordScore >= CONTACT_LOCATION_MIN_KEYWORD_SCORE ||
        topSemanticScore >= CONTACT_LOCATION_MIN_SEMANTIC_SCORE ||
        topScore >= CONTACT_LOCATION_MIN_TOP_SCORE;
      const bypassEarlyGuardForContact = isContactLocationIntent && hasReasonableContactSignal;

      if (!bypassEarlyGuardForContact && (weakByTopScore || weakBySemantic || weakByKeyword || ambiguousTop)) {
        return {
          answer: getLowSimilarityReply(fallbackSuggestions),
          confidence,
          sources,
          suggestions: fallbackSuggestions,
          type: 'university',
          intent: intentProfile.intent,
          rewrittenQuestion: wasRewritten ? effectiveQuestion : undefined,
          degraded,
          errorCode: degraded && upstreamErrorType === 'timeout' ? 'UPSTREAM_TIMEOUT' : undefined,
        };
      }

      let answer = topMatches[0]?.answer || NO_INFO_MESSAGE;
      let errorCode: SmartChatStructuredResponse['errorCode'];
      if (apiKey) {
        const generated = await generateAnswerGemini(apiKey, effectiveQuestion, topMatches);
        usedLLM = generated.usedModel;
        answer = generated.answer || NO_INFO_MESSAGE;
        degraded = degraded || Boolean(generated.degraded);
        if (generated.errorType === 'timeout') {
          errorCode = 'UPSTREAM_TIMEOUT';
        } else if (generated.errorType === 'network' || generated.errorType === 'http') {
          errorCode = 'UPSTREAM_UNAVAILABLE';
        }
      } else {
        usedLLM = 'keyword-only';
      }

      return {
        answer,
        confidence,
        sources,
        suggestions,
        type: 'university',
        intent: intentProfile.intent,
        rewrittenQuestion: wasRewritten ? effectiveQuestion : undefined,
        degraded,
        errorCode,
      };
    })();

    inFlightAnswers.set(cacheKey, processingPromise);
    let responsePayload: Omit<SmartChatStructuredResponse, 'traceId'>;
    try {
      responsePayload = await processingPromise;
    } finally {
      inFlightAnswers.delete(cacheKey);
    }

    pruneAnswerCache();
    answerCache.set(cacheKey, {
      answer: responsePayload.answer,
      confidence: responsePayload.confidence,
      sources: responsePayload.sources,
      suggestions: responsePayload.suggestions,
      type: responsePayload.type,
      intent: responsePayload.intent,
      rewrittenQuestion: responsePayload.rewrittenQuestion,
      degraded: responsePayload.degraded,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    return respond(responsePayload);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error.';
    console.error('smartchat api error:', message);
    return respond({
      answer: GENERIC_ERROR_MESSAGE,
      confidence: 0,
      sources: [],
      suggestions: [],
      type: 'university',
      intent: 'general_university',
      errorCode: 'SERVICE_UNAVAILABLE',
    });
  } finally {
    console.log('[smartchat] usedLLM:', usedLLM);
    console.log('[smartchat] semanticScore:', semanticScoreLog);
    console.log('[smartchat] finalScore:', finalScoreLog);
    console.log('[smartchat] questionMatchScore:', questionMatchScoreLog);
    console.log('[smartchat] responseTime:', `${Date.now() - startedAt}ms`);
  }
}


