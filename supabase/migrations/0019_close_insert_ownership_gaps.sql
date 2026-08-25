-- Fecha lacuna sistemica: policies de INSERT (e UPDATE em shared_routine_links)
-- verificavam auth.uid() = user_id mas nao confirmavam que as demais FKs da
-- linha pertencem ao usuario. Checagem de FK/unique no Postgres sempre ignora
-- RLS. Mesmo padrao ja usado em habit_frequency_days (0004) e routine_steps (0003).

-- H1 (alta prioridade, exposto publicamente via get_shared_routine): sem essa
-- checagem, um usuario autenticado podia criar um shared_routine_links
-- apontando routine_id para a rotina de outra pessoa (sabendo o UUID) e gerar
-- um token publico que expõe nome da rotina e titulos/ordem das etapas de
-- quem nao e o dono do link.
drop policy "Usuarios criam seus proprios links de compartilhamento" on public.shared_routine_links;
create policy "Usuarios criam seus proprios links de compartilhamento"
  on public.shared_routine_links for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.routines
      where routines.id = shared_routine_links.routine_id
        and routines.user_id = auth.uid()
    )
  );

-- Mesma lacuna no UPDATE: sem with check explicito, o Postgres reusa o
-- using() como check, que so revalida user_id - um update podia trocar o
-- routine_id de um link ja existente (proprio) para apontar pra rotina de
-- outra pessoa. Adiciona with check explicito com a mesma checagem.
drop policy "Usuarios revogam seus proprios links de compartilhamento" on public.shared_routine_links;
create policy "Usuarios revogam seus proprios links de compartilhamento"
  on public.shared_routine_links for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.routines
      where routines.id = shared_routine_links.routine_id
        and routines.user_id = auth.uid()
    )
  );

-- M1 (media prioridade, defesa em profundidade - exige usuario autenticado,
-- nao exposto publicamente): mesmo padrao nas 8 tabelas restantes.

drop policy "Usuarios criam suas proprias conclusoes de etapas" on public.routine_step_completions;
create policy "Usuarios criam suas proprias conclusoes de etapas"
  on public.routine_step_completions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.routine_steps
      join public.routines on routines.id = routine_steps.routine_id
      where routine_steps.id = routine_step_completions.routine_step_id
        and routines.user_id = auth.uid()
    )
  );

drop policy "Usuarios criam suas proprias conclusoes de habitos" on public.habit_completions;
create policy "Usuarios criam suas proprias conclusoes de habitos"
  on public.habit_completions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.habits
      where habits.id = habit_completions.habit_id
        and habits.user_id = auth.uid()
    )
  );

drop policy "Usuarios criam suas proprias transacoes" on public.finance_transactions;
create policy "Usuarios criam suas proprias transacoes"
  on public.finance_transactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.finance_accounts
      where finance_accounts.id = finance_transactions.account_id
        and finance_accounts.user_id = auth.uid()
    )
    and (
      related_account_id is null
      or exists (
        select 1 from public.finance_accounts
        where finance_accounts.id = finance_transactions.related_account_id
          and finance_accounts.user_id = auth.uid()
      )
    )
    and (
      category_id is null
      or exists (
        select 1 from public.finance_categories
        where finance_categories.id = finance_transactions.category_id
          and (finance_categories.is_system = true or finance_categories.user_id = auth.uid())
      )
    )
  );

drop policy "Usuarios criam suas proprias recorrencias financeiras" on public.finance_recurring_transactions;
create policy "Usuarios criam suas proprias recorrencias financeiras"
  on public.finance_recurring_transactions for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.finance_accounts
      where finance_accounts.id = finance_recurring_transactions.account_id
        and finance_accounts.user_id = auth.uid()
    )
    and (
      category_id is null
      or exists (
        select 1 from public.finance_categories
        where finance_categories.id = finance_recurring_transactions.category_id
          and (finance_categories.is_system = true or finance_categories.user_id = auth.uid())
      )
    )
  );

drop policy "Usuarios criam seus proprios lembretes" on public.reminders;
create policy "Usuarios criam seus proprios lembretes"
  on public.reminders for insert
  with check (
    auth.uid() = user_id
    and (
      task_id is null
      or exists (select 1 from public.tasks where tasks.id = reminders.task_id and tasks.user_id = auth.uid())
    )
    and (
      habit_id is null
      or exists (select 1 from public.habits where habits.id = reminders.habit_id and habits.user_id = auth.uid())
    )
    and (
      routine_step_id is null
      or exists (
        select 1 from public.routine_steps
        join public.routines on routines.id = routine_steps.routine_id
        where routine_steps.id = reminders.routine_step_id
          and routines.user_id = auth.uid()
      )
    )
    and (
      finance_transaction_id is null
      or exists (
        select 1 from public.finance_transactions
        where finance_transactions.id = reminders.finance_transaction_id
          and finance_transactions.user_id = auth.uid()
      )
    )
  );

drop policy "Usuarios criam seus proprios lancamentos de meta" on public.goal_progress_entries;
create policy "Usuarios criam seus proprios lancamentos de meta"
  on public.goal_progress_entries for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.goals
      where goals.id = goal_progress_entries.goal_id
        and goals.user_id = auth.uid()
    )
  );

drop policy "Usuarios criam suas proprias sessoes de foco" on public.focus_sessions;
create policy "Usuarios criam suas proprias sessoes de foco"
  on public.focus_sessions for insert
  with check (
    auth.uid() = user_id
    and (
      task_id is null
      or exists (select 1 from public.tasks where tasks.id = focus_sessions.task_id and tasks.user_id = auth.uid())
    )
  );

drop policy "Usuarios criam seus proprios orcamentos" on public.finance_budgets;
create policy "Usuarios criam seus proprios orcamentos"
  on public.finance_budgets for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.finance_categories
      where finance_categories.id = finance_budgets.category_id
        and (finance_categories.is_system = true or finance_categories.user_id = auth.uid())
    )
  );
