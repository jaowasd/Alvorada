-- Metas pessoais nao-financeiras: acumular ate um alvo (ex. "12 livros", "200 km")
-- ou meta booleana (target_value nulo = feito/nao-feito). Progresso e sempre a soma
-- dos lancamentos em goal_progress_entries, nunca um valor guardado.
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  target_value numeric,
  unit text,
  deadline_date date,
  status text not null default 'active'
    check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "Usuarios veem suas proprias metas"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias metas"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias metas"
  on public.goals for update
  using (auth.uid() = user_id);

create policy "Usuarios excluem suas proprias metas"
  on public.goals for delete
  using (auth.uid() = user_id);

create trigger set_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

create table if not exists public.goal_progress_entries (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  amount numeric not null,
  entry_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.goal_progress_entries enable row level security;

create policy "Usuarios veem seus proprios lancamentos de meta"
  on public.goal_progress_entries for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seus proprios lancamentos de meta"
  on public.goal_progress_entries for insert
  with check (auth.uid() = user_id);

create policy "Usuarios excluem seus proprios lancamentos de meta"
  on public.goal_progress_entries for delete
  using (auth.uid() = user_id);

create index if not exists goal_progress_entries_goal_idx
  on public.goal_progress_entries (goal_id);
