-- Diario rapido: humor + nota opcional, uma entrada por dia.
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null,
  mood text not null
    check (mood in ('otimo', 'bom', 'neutro', 'dificil', 'pesado')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);

alter table public.journal_entries enable row level security;

create policy "Usuarios veem suas proprias entradas de diario"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias entradas de diario"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias entradas de diario"
  on public.journal_entries for update
  using (auth.uid() = user_id);

create trigger set_journal_entries_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date);
