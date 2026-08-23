-- Preferencias financeiras do usuario (1:1 com o usuario).
create table if not exists public.finance_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  currency text not null default 'BRL' check (currency = 'BRL'),
  monthly_income_cents bigint check (monthly_income_cents is null or monthly_income_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_settings enable row level security;

create policy "Usuarios veem as proprias configuracoes financeiras"
  on public.finance_settings for select
  using (auth.uid() = user_id);

create policy "Usuarios criam as proprias configuracoes financeiras"
  on public.finance_settings for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam as proprias configuracoes financeiras"
  on public.finance_settings for update
  using (auth.uid() = user_id);

create trigger set_finance_settings_updated_at
  before update on public.finance_settings
  for each row execute function public.set_updated_at();

-- Categorias financeiras: do sistema (user_id nulo) ou proprias do usuario,
-- sempre marcadas como receita ou despesa.
create table if not exists public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('income', 'expense')),
  parent_category_id uuid references public.finance_categories (id) on delete set null,
  icon text not null default 'Circle',
  color text not null default '#78716c',
  is_system boolean not null default false,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (is_system = true or user_id is not null)
);

alter table public.finance_categories enable row level security;

create policy "Categorias financeiras do sistema ou proprias sao visiveis"
  on public.finance_categories for select
  using (is_system = true or user_id = auth.uid());

create policy "Usuarios criam suas proprias categorias financeiras"
  on public.finance_categories for insert
  with check (user_id = auth.uid() and is_system = false);

create policy "Usuarios atualizam suas proprias categorias financeiras"
  on public.finance_categories for update
  using (user_id = auth.uid() and is_system = false)
  with check (user_id = auth.uid() and is_system = false);

create trigger set_finance_categories_updated_at
  before update on public.finance_categories
  for each row execute function public.set_updated_at();

create unique index if not exists finance_categories_system_name_idx
  on public.finance_categories (name)
  where is_system = true;

create unique index if not exists finance_categories_user_name_kind_idx
  on public.finance_categories (user_id, name, kind)
  where archived_at is null and is_system = false;

create index if not exists finance_categories_user_id_idx
  on public.finance_categories (user_id)
  where archived_at is null and is_system = false;

create index if not exists finance_categories_parent_category_id_idx
  on public.finance_categories (parent_category_id);

insert into public.finance_categories (name, kind, icon, color, is_system) values
  ('Salário', 'income', 'Wallet', '#16a34a', true),
  ('Freelance / Renda Extra', 'income', 'Briefcase', '#0d9488', true),
  ('Investimentos', 'income', 'TrendingUp', '#0284c7', true),
  ('Outras Receitas', 'income', 'PiggyBank', '#65a30d', true),
  ('Moradia', 'expense', 'Home', '#7c3aed', true),
  ('Contas da Casa', 'expense', 'Zap', '#f59e0b', true),
  ('Alimentação', 'expense', 'Utensils', '#f97316', true),
  ('Transporte', 'expense', 'Car', '#0ea5e9', true),
  ('Saúde', 'expense', 'HeartPulse', '#dc2626', true),
  ('Educação', 'expense', 'BookOpen', '#4f46e5', true),
  ('Lazer', 'expense', 'Gamepad2', '#ec4899', true),
  ('Assinaturas', 'expense', 'RefreshCw', '#06b6d4', true),
  ('Cartão de Crédito', 'expense', 'CreditCard', '#334155', true),
  ('Outras Despesas', 'expense', 'Circle', '#78716c', true)
on conflict (name) where is_system = true do nothing;

-- Garante configuracoes financeiras padrao para cada novo usuario, junto com o perfil.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);

  insert into public.finance_settings (user_id)
  values (new.id);

  return new;
end;
$$;

-- Backfill: cria configuracoes financeiras para usuarios que ja existiam antes desta migration.
insert into public.finance_settings (user_id)
select id from auth.users
on conflict (user_id) do nothing;
