import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { dispatchSmartchatQualityAlert } from '@/services/server/smartchat-alerts';

export const runtime = 'nodejs';

type FeedbackPayload = {
  type?: 'answer_feedback' | 'suggestion_click';
  value?: 'up' | 'down';
  traceId?: string;
  intent?: string;
  confidence?: number;
  answer?: string;
  suggestion?: string;
};

const FEEDBACK_DIR = path.join(process.cwd(), 'data', 'analytics');
const FEEDBACK_LOG_PATH = path.join(FEEDBACK_DIR, 'smartchat-feedback.jsonl');

function clampText(text: unknown, max = 800) {
  const value = String(text || '').trim();
  if (!value) return '';
  return value.length > max ? value.slice(0, max) : value;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as FeedbackPayload;
    const type = body?.type;
    if (type !== 'answer_feedback' && type !== 'suggestion_click') {
      return NextResponse.json({ ok: false, error: 'Invalid feedback type' }, { status: 400 });
    }

    const event = {
      ts: new Date().toISOString(),
      type,
      value: body?.value === 'up' || body?.value === 'down' ? body.value : undefined,
      traceId: clampText(body?.traceId, 120),
      intent: clampText(body?.intent, 80),
      confidence: typeof body?.confidence === 'number' ? body.confidence : undefined,
      answer: clampText(body?.answer, 1200),
      suggestion: clampText(body?.suggestion, 280),
      userAgent: req.headers.get('user-agent') || '',
      referer: req.headers.get('referer') || '',
    };

    fs.mkdirSync(FEEDBACK_DIR, { recursive: true });
    fs.appendFileSync(FEEDBACK_LOG_PATH, `${JSON.stringify(event)}\n`, 'utf8');

    // Run alert dispatch after logging feedback; failures should never break the chat UX.
    dispatchSmartchatQualityAlert().catch(() => null);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
