-- Modo foco: sessoes cronometradas (estilo pomodoro), opcionalmente vinculadas a
-- uma tarefa. completed_at nulo = sessao interrompida (usuario saiu antes do fim);
-- nao ha tentativa de recuperar o tempo restante.
create table if not exists public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete set null,
  label text,
  duration_minutes int not null check (duration_minutes > 0 and duration_minutes <= 240),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.focus_sessions enable row level security;

create policy "Usuarios veem suas proprias sessoes de foco"
  on public.focus_sessions for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias sessoes de foco"
  on public.focus_sessions for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias sessoes de foco"
  on public.focus_sessions for update
  using (auth.uid() = user_id);

create index if not exists focus_sessions_user_started_idx
  on public.focus_sessions (user_id, started_at);
