-- Token de assinatura do calendario (.ics). Diferente de uma sessao normal,
-- apps de calendario externo (Google Calendar, Apple Calendar) fazem GET
-- periodico na URL sem login interativo - por isso um token de longa duracao
-- por usuario, em vez do JWT de sessao. Validado pela Edge Function
-- "export-ics" usando a service role key (ver supabase/functions/export-ics).
create table if not exists public.ics_export_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  token text not null unique,
  created_at timestamptz not null default now()
);

alter table public.ics_export_tokens enable row level security;

create policy "Usuarios veem seu proprio token de exportacao"
  on public.ics_export_tokens for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seu proprio token de exportacao"
  on public.ics_export_tokens for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam seu proprio token de exportacao"
  on public.ics_export_tokens for update
  using (auth.uid() = user_id);

create policy "Usuarios revogam seu proprio token de exportacao"
  on public.ics_export_tokens for delete
  using (auth.uid() = user_id);
