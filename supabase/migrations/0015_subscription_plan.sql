-- Plano de assinatura (Free/Premium). Ainda NAO existe cobranca real (sem
-- gateway de pagamento) - a troca de plano e "self-serve simulada": o
-- usuario troca com um clique via a funcao set_own_plan abaixo, que fica
-- pronta para, no futuro, passar a validar um pagamento real antes de
-- aceitar a troca. Por enquanto o objetivo e so ter a infraestrutura pronta.
--
-- A policy de update de profiles (migration 0001) usa "using (auth.uid() = id)"
-- sem "with check", entao sem a revogacao de privilegio de coluna abaixo
-- qualquer usuario autenticado poderia virar Premium direto via
-- supabase-js (`update profiles set plan = 'premium'`). Revogar UPDATE
-- dessas duas colunas da role authenticated fecha esse caminho: a unica
-- forma de mudar o proprio plano passa a ser a funcao security definer.
alter table public.profiles
  add column plan text not null default 'free' check (plan in ('free', 'premium')),
  add column plan_updated_at timestamptz;

revoke update (plan, plan_updated_at) on public.profiles from authenticated;

create or replace function public.set_own_plan(p_plan text)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  result public.profiles;
begin
  if p_plan not in ('free', 'premium') then
    raise exception 'Plano invalido: %', p_plan;
  end if;

  update public.profiles
  set plan = p_plan,
      plan_updated_at = now()
  where id = auth.uid()
  returning * into result;

  return result;
end;
$$;

revoke all on function public.set_own_plan(text) from public;
grant execute on function public.set_own_plan(text) to authenticated;
