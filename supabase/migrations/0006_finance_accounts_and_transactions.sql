-- Contas do usuario (banco, poupanca, carteira digital, dinheiro fisico, investimento manual, outra).
create table if not exists public.finance_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  type text not null check (type in ('checking', 'savings', 'wallet', 'cash', 'investment', 'other')),
  initial_balance_cents bigint not null default 0,
  include_in_total boolean not null default true,
  icon text not null default 'Wallet',
  color text not null default '#78716c',
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.finance_accounts enable row level security;

create policy "Usuarios veem suas proprias contas"
  on public.finance_accounts for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias contas"
  on public.finance_accounts for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias contas"
  on public.finance_accounts for update
  using (auth.uid() = user_id);

create trigger set_finance_accounts_updated_at
  before update on public.finance_accounts
  for each row execute function public.set_updated_at();

create index if not exists finance_accounts_user_id_idx
  on public.finance_accounts (user_id)
  where archived_at is null;

-- Receitas, despesas e transferencias entre contas.
-- Transferencias sao uma unica linha (type='transfer', account_id=origem,
-- related_account_id=destino) para nao depender de duas escritas atomicas.
create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('income', 'expense', 'transfer')),
  description text not null,
  amount_cents bigint not null check (amount_cents > 0),
  category_id uuid references public.finance_categories (id) on delete set null,
  account_id uuid not null references public.finance_accounts (id) on delete restrict,
  related_account_id uuid references public.finance_accounts (id) on delete restrict,
  payment_method text check (payment_method in ('pix', 'boleto', 'debit_card', 'credit_card', 'cash', 'bank_transfer', 'other')),
  status text not null default 'planned' check (status in ('planned', 'confirmed')),
  due_date date not null,
  paid_at date,
  notes text,
  reversal_of_transaction_id uuid references public.finance_transactions (id) on delete set null,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (type <> 'transfer' or category_id is null),
  check ((type = 'transfer') = (related_account_id is not null)),
  check (related_account_id is null or related_account_id <> account_id)
);

alter table public.finance_transactions enable row level security;

create policy "Usuarios veem suas proprias transacoes"
  on public.finance_transactions for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias transacoes"
  on public.finance_transactions for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias transacoes"
  on public.finance_transactions for update
  using (auth.uid() = user_id);

create trigger set_finance_transactions_updated_at
  before update on public.finance_transactions
  for each row execute function public.set_updated_at();

create index if not exists finance_transactions_user_due_date_idx
  on public.finance_transactions (user_id, due_date)
  where deleted_at is null;

create index if not exists finance_transactions_user_account_idx
  on public.finance_transactions (user_id, account_id)
  where deleted_at is null;

create index if not exists finance_transactions_user_category_idx
  on public.finance_transactions (user_id, category_id)
  where deleted_at is null;

create index if not exists finance_transactions_user_status_due_date_idx
  on public.finance_transactions (user_id, status, due_date)
  where deleted_at is null;
