-- Expiracao opcional para os dois tokens que dao acesso sem login (rotina
-- compartilhada e assinatura de calendario .ics). Nula = nunca expira
-- (comportamento atual preservado); o usuario escolhe a expiracao na hora
-- de gerar o link/token na UI.
alter table public.shared_routine_links
  add column expires_at timestamptz;

alter table public.ics_export_tokens
  add column expires_at timestamptz;

-- Recria get_shared_routine (migration 0013) acrescentando a checagem de
-- expiracao. Mantem a mesma politica de nao distinguir "nao existe",
-- "revogado" e "expirado" - zero linhas nos tres casos.
create or replace function public.get_shared_routine(p_token text)
returns table (
  routine_name text,
  step_title text,
  step_order_index int
)
language sql
security definer
set search_path = public
stable
as $$
  select r.name, s.title, s.order_index
  from public.shared_routine_links l
  join public.routines r on r.id = l.routine_id
  join public.routine_steps s on s.routine_id = r.id
  where l.token = p_token
    and l.revoked_at is null
    and (l.expires_at is null or l.expires_at > now())
    and s.deleted_at is null
  order by s.order_index;
$$;

revoke all on function public.get_shared_routine(text) from public;
grant execute on function public.get_shared_routine(text) to anon, authenticated;
