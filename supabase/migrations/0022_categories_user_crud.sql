-- Habilita categorias personalizadas de habito/tarefa/rotina, espelhando
-- exatamente o padrao ja usado em finance_categories (0005): is_system/user_id
-- ja existiam em 0002 (categories), so faltava CRUD real.
--
-- Diferente de finance_categories, aqui optamos por DELETE real (nao
-- archived_at): tasks.category_id, habits.category_id e
-- routine_steps.category_id ja sao `on delete set null`, entao apagar uma
-- categoria e seguro e nao quebra historico. finance_categories usa
-- archived_at porque RelatoriosPage depende de categoria preservada em
-- lancamentos passados; nao ha equivalente aqui.

alter table public.categories
  add constraint categories_is_system_or_user check (is_system = true or user_id is not null),
  add constraint categories_name_length check (char_length(name) <= 60);

create policy "Usuarios criam suas proprias categorias"
  on public.categories for insert
  with check (user_id = auth.uid() and is_system = false);

create policy "Usuarios atualizam suas proprias categorias"
  on public.categories for update
  using (user_id = auth.uid() and is_system = false)
  with check (user_id = auth.uid() and is_system = false);

create policy "Usuarios excluem suas proprias categorias"
  on public.categories for delete
  using (user_id = auth.uid() and is_system = false);

create unique index if not exists categories_user_name_idx
  on public.categories (user_id, name)
  where is_system = false;
