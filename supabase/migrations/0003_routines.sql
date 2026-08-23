-- Rotina matinal do usuário e suas etapas ordenáveis.
create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routines enable row level security;

create policy "Usuarios veem suas proprias rotinas"
  on public.routines for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias rotinas"
  on public.routines for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias rotinas"
  on public.routines for update
  using (auth.uid() = user_id);

create trigger set_routines_updated_at
  before update on public.routines
  for each row execute function public.set_updated_at();

-- Etapas da rotina (soft delete: preservam historico de conclusoes/streaks).
create table if not exists public.routine_steps (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  title text not null,
  notes text,
  category_id uuid references public.categories (id) on delete set null,
  estimated_duration_minutes integer,
  order_index integer not null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.routine_steps enable row level security;

create policy "Usuarios veem etapas das proprias rotinas"
  on public.routine_steps for select
  using (
    exists (
      select 1 from public.routines
      where routines.id = routine_steps.routine_id
        and routines.user_id = auth.uid()
    )
  );

create policy "Usuarios criam etapas nas proprias rotinas"
  on public.routine_steps for insert
  with check (
    exists (
      select 1 from public.routines
      where routines.id = routine_steps.routine_id
        and routines.user_id = auth.uid()
    )
  );

create policy "Usuarios atualizam etapas das proprias rotinas"
  on public.routine_steps for update
  using (
    exists (
      select 1 from public.routines
      where routines.id = routine_steps.routine_id
        and routines.user_id = auth.uid()
    )
  );

create trigger set_routine_steps_updated_at
  before update on public.routine_steps
  for each row execute function public.set_updated_at();

create index if not exists routine_steps_routine_id_order_idx
  on public.routine_steps (routine_id, order_index)
  where deleted_at is null;

-- Registro de conclusao de cada etapa, por dia (data local do usuario).
create table if not exists public.routine_step_completions (
  id uuid primary key default gen_random_uuid(),
  routine_step_id uuid not null references public.routine_steps (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  completion_date date not null,
  completed_at timestamptz not null default now(),
  unique (routine_step_id, completion_date)
);

alter table public.routine_step_completions enable row level security;

create policy "Usuarios veem suas proprias conclusoes de etapas"
  on public.routine_step_completions for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias conclusoes de etapas"
  on public.routine_step_completions for insert
  with check (auth.uid() = user_id);

create policy "Usuarios removem suas proprias conclusoes de etapas"
  on public.routine_step_completions for delete
  using (auth.uid() = user_id);

create index if not exists routine_step_completions_user_date_idx
  on public.routine_step_completions (user_id, completion_date);
