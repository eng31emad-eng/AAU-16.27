-- Persistent KB storage for Smart Chat (Supabase / Postgres)
create table if not exists public.smartchat_kb_index (
  id text primary key,
  index_payload jsonb not null,
  count integer not null default 0,
  source_hash text,
  source_url text,
  updated_at timestamptz not null default now()
);

-- Optional but useful for query speed if table grows later
create index if not exists smartchat_kb_index_updated_at_idx
  on public.smartchat_kb_index (updated_at desc);

