-- Rotina compartilhavel: link publico somente-leitura de uma rotina, sem exigir
-- login de quem visualiza. A leitura publica NAO pode passar pela RLS padrao
-- (que exige auth.uid() = user_id), entao usamos uma funcao security definer
-- que valida o token e devolve só nome da rotina + titulos/ordem das etapas -
-- nunca user_id, notas, categoria, duracao ou qualquer outro dado da conta.
create table if not exists public.shared_routine_links (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);

alter table public.shared_routine_links enable row level security;

create policy "Usuarios veem seus proprios links de compartilhamento"
  on public.shared_routine_links for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seus proprios links de compartilhamento"
  on public.shared_routine_links for insert
  with check (auth.uid() = user_id);

create policy "Usuarios revogam seus proprios links de compartilhamento"
  on public.shared_routine_links for update
  using (auth.uid() = user_id);

create index if not exists shared_routine_links_routine_idx
  on public.shared_routine_links (routine_id)
  where revoked_at is null;

-- Funcao publica: recebe o token, devolve só o necessário pra renderizar a
-- pagina de leitura. Zero linhas se o token nao existir ou tiver sido revogado
-- (sem distinguir os dois casos, pra nao vazar se um token já existiu um dia).
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
    and s.deleted_at is null
  order by s.order_index;
$$;

revoke all on function public.get_shared_routine(text) from public;
grant execute on function public.get_shared_routine(text) to anon, authenticated;
