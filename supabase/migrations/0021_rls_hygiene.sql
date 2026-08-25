-- L1: profiles UPDATE sem with check explicito (ja mitigado hoje via revoke
-- de coluna em 0015, mas inconsistente com finance_categories que ja e explicita)
drop policy "Usuarios podem atualizar o proprio perfil" on public.profiles;
create policy "Usuarios podem atualizar o proprio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- L2: delete_own_account sem o revoke from public que seus irmaos SECURITY
-- DEFINER (get_shared_routine, set_own_plan) tem. Inofensivo hoje, fecha por
-- consistencia/futuro-proofing.
revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
