import type { KbSourceRef } from '@/types/kb';
export { loadKbIndex } from '@/lib/kb-store'

export function toSourceRef(
  question: string,
  answer: string,
  itemId: number | string,
  index = 0
): KbSourceRef {
  return {
    sourceId: `faq-${itemId}`,
    sourceName: `FAQ #${index + 1}`,
    sourceType: 'faq',
    chunkId: `faq-${itemId}`,
    excerpt: `س: ${question}\nج: ${answer}`,
  };
}
