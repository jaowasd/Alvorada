-- Permite que o proprio usuario exclua a conta. Precisa de security definer
-- porque apagar de auth.users exige privilegio que a chave anonima nao tem.
-- Toda tabela do app referencia auth.users com "on delete cascade", entao
-- apagar essa linha remove automaticamente todos os dados do usuario
-- (profiles, tasks, habits, rotina, financas, etc.) sem precisar apagar
-- tabela por tabela aqui.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from auth.users where id = auth.uid();
end;
$$;

grant execute on function public.delete_own_account() to authenticated;
