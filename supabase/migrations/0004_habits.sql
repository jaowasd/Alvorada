-- Habitos (diarios ou em dias especificos da semana).
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  notes text,
  category_id uuid references public.categories (id) on delete set null,
  estimated_duration_minutes integer,
  frequency_type text not null default 'daily'
    check (frequency_type in ('daily', 'specific_days')),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.habits enable row level security;

create policy "Usuarios veem seus proprios habitos"
  on public.habits for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seus proprios habitos"
  on public.habits for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam seus proprios habitos"
  on public.habits for update
  using (auth.uid() = user_id);

create trigger set_habits_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();

-- Dias da semana em que um habito de frequencia especifica esta ativo.
create table if not exists public.habit_frequency_days (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  unique (habit_id, weekday)
);

alter table public.habit_frequency_days enable row level security;

create policy "Usuarios veem dias dos proprios habitos"
  on public.habit_frequency_days for select
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_frequency_days.habit_id
        and habits.user_id = auth.uid()
    )
  );

create policy "Usuarios criam dias nos proprios habitos"
  on public.habit_frequency_days for insert
  with check (
    exists (
      select 1 from public.habits
      where habits.id = habit_frequency_days.habit_id
        and habits.user_id = auth.uid()
    )
  );

create policy "Usuarios removem dias dos proprios habitos"
  on public.habit_frequency_days for delete
  using (
    exists (
      select 1 from public.habits
      where habits.id = habit_frequency_days.habit_id
        and habits.user_id = auth.uid()
    )
  );

-- Registro de conclusao de cada habito, por dia (data local do usuario).
create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completion_date date not null,
  completed_at timestamptz not null default now(),
  unique (habit_id, completion_date)
);

alter table public.habit_completions enable row level security;

create policy "Usuarios veem suas proprias conclusoes de habitos"
  on public.habit_completions for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias conclusoes de habitos"
  on public.habit_completions for insert
  with check (auth.uid() = user_id);

create policy "Usuarios removem suas proprias conclusoes de habitos"
  on public.habit_completions for delete
  using (auth.uid() = user_id);

create index if not exists habit_completions_user_date_idx
  on public.habit_completions (user_id, completion_date);
