-- Tabela de perfis, criada automaticamente quando um usuário se cadastra.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  timezone text not null default 'America/Sao_Paulo',
  wake_time_target time,
  theme_preference text not null default 'system'
    check (theme_preference in ('light', 'dark', 'system')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios podem ver o proprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Usuarios podem atualizar o proprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Cria automaticamente um perfil quando um novo usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantém updated_at sempre atualizado.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();
