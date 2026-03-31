export type KbSourceType = 'faq' | 'page' | 'pdf' | 'policy';

export interface KbSourceRef {
  sourceId: string;
  sourceName: string;
  sourceType: KbSourceType;
  sourceUrl?: string;
  chunkId: string;
  excerpt: string;
}

export interface KbChunk {
  id: string;
  question: string;
  answer: string;
  embedding?: number[];
  metadata?: Record<string, any>;
}

export interface KbIndex {
  createdAt: string;
  count: number;
  model: string;
  items: KbChunk[];
}

export interface SmartChatStructuredResponse {
  answer: string;
  confidence: number;
  sources: KbSourceRef[];
  suggestions: string[];
  type: 'small_talk' | 'university' | 'outside';
  intent:
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
  rewrittenQuestion?: string;
  cached?: boolean;
  degraded?: boolean;
  errorCode?: 'RATE_LIMIT' | 'UPSTREAM_TIMEOUT' | 'UPSTREAM_UNAVAILABLE' | 'SERVICE_UNAVAILABLE' | 'BAD_REQUEST';
  retryAfterSeconds?: number;
  traceId: string;
}
