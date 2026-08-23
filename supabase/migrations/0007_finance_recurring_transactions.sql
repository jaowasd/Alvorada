-- Modelos de receita/despesa recorrente. Tambem cobre "contas da casa"
-- (aluguel, energia, agua, etc.): sao apenas recorrencias tipo despesa com
-- categoria domestica, sem tabela propria.
create table if not exists public.finance_recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  description text not null,
  amount_cents bigint not null check (amount_cents > 0),
  is_variable_amount boolean not null default false,
  category_id uuid references public.finance_categories (id) on delete set null,
  account_id uuid not null references public.finance_accounts (id) on delete restrict,
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
  check (end_date is null or end_date >= start_date)
);

alter table public.finance_recurring_transactions enable row level security;

create policy "Usuarios veem suas proprias recorrencias financeiras"
  on public.finance_recurring_transactions for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias recorrencias financeiras"
  on public.finance_recurring_transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias recorrencias financeiras"
  on public.finance_recurring_transactions for update
  using (auth.uid() = user_id);

create trigger set_finance_recurring_transactions_updated_at
  before update on public.finance_recurring_transactions
  for each row execute function public.set_updated_at();

create index if not exists finance_recurring_transactions_user_id_idx
  on public.finance_recurring_transactions (user_id)
  where archived_at is null and is_active = true;

-- Liga cada transacao gerada a recorrencia que a originou (adicionada aqui
-- via alter table porque finance_recurring_transactions ainda nao existia
-- quando finance_transactions foi criada).
alter table public.finance_transactions
  add column recurring_transaction_id uuid
    references public.finance_recurring_transactions (id) on delete set null;

create unique index if not exists finance_transactions_recurring_due_date_idx
  on public.finance_transactions (recurring_transaction_id, due_date)
  where recurring_transaction_id is not null;
