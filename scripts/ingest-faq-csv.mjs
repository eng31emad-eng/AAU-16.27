#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

function parseCsv(content, delimiter = ';') {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const ch = content[i];
    const next = content[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && ch === delimiter) {
      row.push(field);
      field = '';
      continue;
    }

    if (!inQuotes && (ch === '\n' || ch === '\r')) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      continue;
    }

    field += ch;
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function clean(value) {
  return String(value || '').replace(/\uFEFF/g, '').trim();
}

function usage() {
  console.log('Usage: node scripts/ingest-faq-csv.mjs <input.csv> [output.json] [sourceUrl]');
}

const inputPath = process.argv[2];
const outputPath = process.argv[3] || path.join(process.cwd(), 'data', 'faq_index.json');
const sourceUrl = process.argv[4] || '';

if (!inputPath) {
  usage();
  process.exit(1);
}

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const rows = parseCsv(raw, ';');
if (!rows.length) {
  console.error('CSV is empty');
  process.exit(1);
}

const headers = rows[0].map((h) => clean(h).toLowerCase());
const questionIdx = headers.findIndex((h) => h === 'question' || h === 'questionar');
const answerIdx = headers.findIndex((h) => h === 'answer' || h === 'answerar');

if (questionIdx < 0 || answerIdx < 0) {
  console.error('CSV must include question and answer columns.');
  process.exit(1);
}

let id = 1;
const items = [];
for (let i = 1; i < rows.length; i += 1) {
  const row = rows[i];
  const question = clean(row[questionIdx]);
  const answer = clean(row[answerIdx]);
  if (!question || !answer) continue;

  items.push({
    id,
    question,
    answer,
    embedding: [],
    metadata: {
      sourceType: 'faq',
      sourceName: 'FAQ CSV',
      sourceUrl: sourceUrl || undefined,
      excerpt: `س: ${question}\nج: ${answer}`,
      importedAt: new Date().toISOString(),
    },
  });
  id += 1;
}

const payload = {
  createdAt: new Date().toISOString(),
  count: items.length,
  model: 'keyword-only',
  items,
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Done. Wrote ${items.length} items to ${outputPath}`);
