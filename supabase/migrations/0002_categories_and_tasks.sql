-- Categorias (fixas do sistema no MVP; user_id fica pronto para categorias
-- personalizadas no futuro).
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  icon text not null default 'Circle',
  color text not null default '#78716c',
  is_system boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;

create policy "Categorias do sistema ou proprias sao visiveis"
  on public.categories for select
  using (is_system = true or user_id = auth.uid());

create unique index if not exists categories_system_name_idx
  on public.categories (name)
  where is_system = true;

insert into public.categories (name, icon, color, is_system) values
  ('Sono', 'Moon', '#0d9488', true),
  ('Hidratação', 'Droplet', '#0ea5e9', true),
  ('Alimentação', 'Utensils', '#f59e0b', true),
  ('Exercícios', 'Dumbbell', '#dc2626', true),
  ('Estudos', 'BookOpen', '#7c3aed', true),
  ('Meditação', 'Brain', '#0d9488', true),
  ('Outro', 'Circle', '#78716c', true)
on conflict (name) where is_system = true do nothing;

-- Tarefas avulsas.
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  notes text,
  category_id uuid references public.categories (id) on delete set null,
  estimated_duration_minutes integer,
  due_date date,
  is_completed boolean not null default false,
  completed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Usuarios veem apenas suas tarefas"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias tarefas"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias tarefas"
  on public.tasks for update
  using (auth.uid() = user_id);

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create index if not exists tasks_user_id_due_date_idx
  on public.tasks (user_id, due_date)
  where deleted_at is null;
