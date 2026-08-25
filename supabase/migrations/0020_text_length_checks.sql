-- Extensao do padrao de 0017 (journal_entries.notes, reminders.message,
-- reminders.custom_label) para as colunas de texto livre restantes que
-- ainda nao tinham limite em nenhuma camada. Onde ja existe um Zod
-- correspondente no cliente, o valor abaixo e o mesmo - o objetivo e o
-- banco concordar com a validacao que ja existe, nao escolher limites novos.

-- profiles.display_name: src/lib/validation/profile.ts (30)
-- profiles.avatar_url: sem Zod correspondente hoje - valor novo.
alter table public.profiles
  add constraint profiles_display_name_length check (char_length(display_name) <= 30),
  add constraint profiles_avatar_url_length check (char_length(avatar_url) <= 2048);

-- tasks.title / notes: src/lib/validation/task.ts (120 / 500)
alter table public.tasks
  add constraint tasks_title_length check (char_length(title) <= 120),
  add constraint tasks_notes_length check (char_length(notes) <= 500);

-- routines.name: sem Zod correspondente hoje - valor novo (120, mesma
-- convencao de tasks.title/habits.name/routine_steps.title).
alter table public.routines
  add constraint routines_name_length check (char_length(name) <= 120);

-- routine_steps.title / notes: src/lib/validation/routineStep.ts (120 / 500)
alter table public.routine_steps
  add constraint routine_steps_title_length check (char_length(title) <= 120),
  add constraint routine_steps_notes_length check (char_length(notes) <= 500);

-- habits.name / notes: src/lib/validation/habit.ts (120 / 500)
alter table public.habits
  add constraint habits_name_length check (char_length(name) <= 120),
  add constraint habits_notes_length check (char_length(notes) <= 500);

-- finance_categories.name: src/lib/validation/financas/category.ts (60)
alter table public.finance_categories
  add constraint finance_categories_name_length check (char_length(name) <= 60);

-- finance_accounts.name: src/lib/validation/financas/account.ts (60)
alter table public.finance_accounts
  add constraint finance_accounts_name_length check (char_length(name) <= 60);

-- finance_transactions.description / notes: src/lib/validation/financas/transaction.ts (120 / 500)
alter table public.finance_transactions
  add constraint finance_transactions_description_length check (char_length(description) <= 120),
  add constraint finance_transactions_notes_length check (char_length(notes) <= 500);

-- finance_recurring_transactions.description: src/lib/validation/financas/recurringTransaction.ts (120)
alter table public.finance_recurring_transactions
  add constraint finance_recurring_transactions_description_length check (char_length(description) <= 120);

-- goals.name / unit: src/lib/validation/goal.ts (120 / 30)
alter table public.goals
  add constraint goals_name_length check (char_length(name) <= 120),
  add constraint goals_unit_length check (char_length(unit) <= 30);

-- goal_progress_entries.notes (M3a): mesmo valor de journal_entries.notes (0017),
-- acompanha o novo src/lib/validation/goalProgress.ts
alter table public.goal_progress_entries
  add constraint goal_progress_entries_notes_length check (char_length(notes) <= 2000);

-- focus_sessions.label (M3b): mesma convencao de reminders.custom_label,
-- acompanha o novo src/lib/validation/focusSession.ts
alter table public.focus_sessions
  add constraint focus_sessions_label_length check (char_length(label) <= 120);
