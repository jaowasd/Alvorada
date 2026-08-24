-- Orcamento mensal por categoria: "limite de gasto mensal desta categoria, a
-- partir de agora" - sem coluna de mes/ano especifico (mais simples que
-- orcamento por mes-calendario, o gasto do mes atual e calculado na leitura
-- a partir de finance_transactions, como o resto do modulo financeiro).
create table if not exists public.finance_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category_id uuid not null references public.finance_categories (id) on delete cascade,
  limit_cents bigint not null check (limit_cents > 0),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_budgets enable row level security;

create policy "Usuarios veem seus proprios orcamentos"
  on public.finance_budgets for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seus proprios orcamentos"
  on public.finance_budgets for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam seus proprios orcamentos"
  on public.finance_budgets for update
  using (auth.uid() = user_id);

create trigger set_finance_budgets_updated_at
  before update on public.finance_budgets
  for each row execute function public.set_updated_at();

-- No maximo um orcamento ativo por categoria.
create unique index if not exists finance_budgets_user_category_active_idx
  on public.finance_budgets (user_id, category_id)
  where archived_at is null;

create index if not exists finance_budgets_user_id_idx
  on public.finance_budgets (user_id)
  where archived_at is null;
