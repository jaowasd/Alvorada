-- Lembretes unificados: um sistema so cobrindo tarefa/habito/etapa de rotina/transacao
-- financeira ou um lembrete avulso (custom_label). MVP in-app, sem push.
create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid references public.tasks (id) on delete cascade,
  habit_id uuid references public.habits (id) on delete cascade,
  routine_step_id uuid references public.routine_steps (id) on delete cascade,
  finance_transaction_id uuid references public.finance_transactions (id) on delete cascade,
  custom_label text,
  remind_at date not null,
  message text,
  is_dismissed boolean not null default false,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reminders_at_most_one_link check (
    (case when task_id is not null then 1 else 0 end)
    + (case when habit_id is not null then 1 else 0 end)
    + (case when routine_step_id is not null then 1 else 0 end)
    + (case when finance_transaction_id is not null then 1 else 0 end)
    <= 1
  )
);

alter table public.reminders enable row level security;

create policy "Usuarios veem seus proprios lembretes"
  on public.reminders for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seus proprios lembretes"
  on public.reminders for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam seus proprios lembretes"
  on public.reminders for update
  using (auth.uid() = user_id);

create policy "Usuarios excluem seus proprios lembretes"
  on public.reminders for delete
  using (auth.uid() = user_id);

create trigger set_reminders_updated_at
  before update on public.reminders
  for each row execute function public.set_updated_at();

create index if not exists reminders_user_active_idx
  on public.reminders (user_id, remind_at)
  where is_dismissed = false;
