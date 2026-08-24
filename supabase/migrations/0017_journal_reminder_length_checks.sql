-- journal_entries.notes e reminders.message/custom_label eram text sem
-- limite algum (nem no Zod nem no banco). Adiciona check no banco como
-- ultima camada de defesa - a validacao real de UX ja acontece no cliente
-- (Zod + maxLength no input), mas o banco nao deve confiar só nisso.
alter table public.journal_entries
  add constraint journal_entries_notes_length check (char_length(notes) <= 2000);

alter table public.reminders
  add constraint reminders_message_length check (char_length(message) <= 500),
  add constraint reminders_custom_label_length check (char_length(custom_label) <= 120);
