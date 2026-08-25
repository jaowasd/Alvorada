-- Tarefas recorrentes: modelos que geram linhas reais em `tasks` sob demanda
-- (sem cron), mesmo desenho de finance_recurring_transactions (0007). Tabela
-- separada em vez de colunas em `tasks` pra nao misturar semantica de
-- "modelo" com o ciclo de vida que tasks ja tem (is_completed/deleted_at).
--
-- Diferente da versao original de finance_recurring_transactions, aqui a
-- policy de INSERT/UPDATE ja nasce checando posse do category_id (padrao
-- 0019) desde o inicio.

create table if not exists public.recurring_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text,
  category_id uuid references public.categories (id) on delete set null,
  estimated_duration_minutes integer,
  frequency text not null check (frequency in ('monthly', 'weekly')),
  day_of_month smallint check (day_of_month between 1 and 31),
  weekday smallint check (weekday between 0 and 6),
  start_date date not null,
  end_date date,
  last_generated_date date,
  is_active boolean not null default true,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (frequency <> 'monthly' or day_of_month is not null),
  check (frequency <> 'weekly' or weekday is not null),
  check (end_date is null or end_date >= start_date),
  constraint recurring_tasks_title_length check (char_length(title) <= 120),
  constraint recurring_tasks_notes_length check (char_length(notes) <= 500)
);

alter table public.recurring_tasks enable row level security;

create policy "Usuarios veem suas proprias tarefas recorrentes"
  on public.recurring_tasks for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias tarefas recorrentes"
  on public.recurring_tasks for insert
  with check (
    auth.uid() = user_id
    and (
      category_id is null
      or exists (
        select 1 from public.categories
        where categories.id = recurring_tasks.category_id
          and (categories.is_system = true or categories.user_id = auth.uid())
      )
    )
  );

create policy "Usuarios atualizam suas proprias tarefas recorrentes"
  on public.recurring_tasks for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      category_id is null
      or exists (
        select 1 from public.categories
        where categories.id = recurring_tasks.category_id
          and (categories.is_system = true or categories.user_id = auth.uid())
      )
    )
  );

create trigger set_recurring_tasks_updated_at
  before update on public.recurring_tasks
  for each row execute function public.set_updated_at();

create index if not exists recurring_tasks_user_id_idx
  on public.recurring_tasks (user_id)
  where archived_at is null and is_active = true;

alter table public.tasks
  add column recurring_task_id uuid references public.recurring_tasks (id) on delete set null;

create unique index if not exists tasks_recurring_due_date_idx
  on public.tasks (recurring_task_id, due_date)
  where recurring_task_id is not null;
