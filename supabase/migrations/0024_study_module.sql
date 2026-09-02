-- Modulo de estudos (contexto: concurso/certificacao). Tres tabelas novas,
-- cada uma espelhando um padrao que ja existe no projeto:
--   study_subjects     -> desenho de finance_categories (0005): nome, cor e
--                         archived_at. Difere de 0005 por ter DELETE real
--                         alem do arquivamento, mesma decisao ja registrada
--                         em 0022 para categories: as duas FKs que apontam
--                         pra ca sao `on delete set null`, entao apagar
--                         degrada a sessao pra "sem materia" em vez de
--                         destruir historico.
--   study_exam_records -> lancamento historico datado, mesmo espirito de
--                         goal_progress_entries (0011).
--   study_settings     -> 1:1 com o usuario, desenho de finance_settings
--                         (0005). Diferente de 0005, handle_new_user NAO e
--                         alterado: redefinir um trigger security definer em
--                         auth.users pra inserir linha nao-critica faz uma
--                         falha ali derrubar o proprio cadastro. A linha
--                         nasce sob demanda no cliente
--                         (fetchOrCreateStudySettings), mesmo padrao de
--                         fetchOrCreateActiveRoutine, o que tambem dispensa
--                         backfill pras contas que ja existem.
--
-- Alem disso, focus_sessions (0012) ganha subject_id: o "modo foco" saiu do
-- dashboard e virou o cronometro da aba Estudos, entao sessao de foco e
-- sessao de estudo passam a ser a mesma coisa - nao existe tabela
-- study_sessions. task_id continua existindo e sendo gravado; nao ha XOR
-- entre as duas FKs porque a agregacao e sempre por subject_id.
--
-- As policies de INSERT/UPDATE de focus_sessions sao recriadas com a
-- checagem de posse de subject_id (padrao 0019) e com `with check` explicito
-- no UPDATE (padrao 0021): a de 0012 so tinha `using`, o que era inofensivo
-- enquanto nada em forma de FK era editavel e vira gap real agora.
-- A tabela tambem ganha DELETE (registro manual errado precisa ser
-- removivel) e um teto de duracao maior - 240 min era politica do cronometro
-- (pomodoro), nao do dado: registrar manualmente um sabado de 8h e legitimo.

-- =====================================================================
-- study_subjects
-- =====================================================================

create table if not exists public.study_subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  color text not null default '#78716c',
  weekly_goal_minutes int,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_subjects_name_length check (char_length(name) <= 60),
  constraint study_subjects_color_format check (color ~ '^#[0-9a-fA-F]{6}$'),
  constraint study_subjects_weekly_goal_range check (
    weekly_goal_minutes is null
    or (weekly_goal_minutes > 0 and weekly_goal_minutes <= 3000)
  )
);

alter table public.study_subjects enable row level security;

create policy "Usuarios veem suas proprias materias"
  on public.study_subjects for select
  using (auth.uid() = user_id);

create policy "Usuarios criam suas proprias materias"
  on public.study_subjects for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam suas proprias materias"
  on public.study_subjects for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Usuarios excluem suas proprias materias"
  on public.study_subjects for delete
  using (auth.uid() = user_id);

create trigger set_study_subjects_updated_at
  before update on public.study_subjects
  for each row execute function public.set_updated_at();

create index if not exists study_subjects_user_id_idx
  on public.study_subjects (user_id)
  where archived_at is null;

-- Evita "Direito Constitucional" duplicado entre as materias ativas.
-- Case-insensitive porque redigitar com outra caixa e o erro comum.
create unique index if not exists study_subjects_user_name_idx
  on public.study_subjects (user_id, lower(name))
  where archived_at is null;

-- =====================================================================
-- study_exam_records
-- =====================================================================

create table if not exists public.study_exam_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid references public.study_subjects (id) on delete set null,
  title text not null,
  kind text not null default 'simulado'
    check (kind in ('simulado', 'prova', 'exercicios')),
  exam_date date not null,
  correct_count int not null check (correct_count >= 0),
  total_questions int not null
    check (total_questions > 0 and total_questions <= 1000),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_exam_records_correct_within_total
    check (correct_count <= total_questions),
  constraint study_exam_records_title_length check (char_length(title) <= 120),
  constraint study_exam_records_notes_length check (char_length(notes) <= 500)
);

alter table public.study_exam_records enable row level security;

create policy "Usuarios veem seus proprios registros de prova"
  on public.study_exam_records for select
  using (auth.uid() = user_id);

create policy "Usuarios criam seus proprios registros de prova"
  on public.study_exam_records for insert
  with check (
    auth.uid() = user_id
    and (
      subject_id is null
      or exists (
        select 1 from public.study_subjects
        where study_subjects.id = study_exam_records.subject_id
          and study_subjects.user_id = auth.uid()
      )
    )
  );

create policy "Usuarios atualizam seus proprios registros de prova"
  on public.study_exam_records for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      subject_id is null
      or exists (
        select 1 from public.study_subjects
        where study_subjects.id = study_exam_records.subject_id
          and study_subjects.user_id = auth.uid()
      )
    )
  );

create policy "Usuarios excluem seus proprios registros de prova"
  on public.study_exam_records for delete
  using (auth.uid() = user_id);

create trigger set_study_exam_records_updated_at
  before update on public.study_exam_records
  for each row execute function public.set_updated_at();

create index if not exists study_exam_records_user_date_idx
  on public.study_exam_records (user_id, exam_date desc);

-- =====================================================================
-- study_settings
-- =====================================================================

create table if not exists public.study_settings (
  user_id uuid primary key references auth.users (id) on delete cascade,
  weekly_goal_minutes int,
  exam_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint study_settings_weekly_goal_range check (
    weekly_goal_minutes is null
    or (weekly_goal_minutes > 0 and weekly_goal_minutes <= 4200)
  )
);

alter table public.study_settings enable row level security;

create policy "Usuarios veem as proprias configuracoes de estudo"
  on public.study_settings for select
  using (auth.uid() = user_id);

create policy "Usuarios criam as proprias configuracoes de estudo"
  on public.study_settings for insert
  with check (auth.uid() = user_id);

create policy "Usuarios atualizam as proprias configuracoes de estudo"
  on public.study_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create trigger set_study_settings_updated_at
  before update on public.study_settings
  for each row execute function public.set_updated_at();

-- =====================================================================
-- focus_sessions: subject_id, teto de duracao e policies
-- =====================================================================

alter table public.focus_sessions
  add column if not exists subject_id uuid
    references public.study_subjects (id) on delete set null;

-- O check de duracao de 0012 foi criado inline, entao o nome dele foi gerado
-- pelo Postgres. Adivinhar o nome num `drop constraint if exists` erraria em
-- silencio e o teto antigo (240) so reapareceria num insert, meses depois -
-- por isso o nome real e lido do catalogo.
do $$
declare
  target record;
begin
  for target in
    select conname
    from pg_constraint
    where conrelid = 'public.focus_sessions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) ilike '%duration_minutes%'
  loop
    execute format(
      'alter table public.focus_sessions drop constraint %I',
      target.conname
    );
  end loop;
end $$;

alter table public.focus_sessions
  add constraint focus_sessions_duration_range
    check (duration_minutes > 0 and duration_minutes <= 600);

drop policy if exists "Usuarios criam suas proprias sessoes de foco"
  on public.focus_sessions;
create policy "Usuarios criam suas proprias sessoes de foco"
  on public.focus_sessions for insert
  with check (
    auth.uid() = user_id
    and (
      task_id is null
      or exists (
        select 1 from public.tasks
        where tasks.id = focus_sessions.task_id
          and tasks.user_id = auth.uid()
      )
    )
    and (
      subject_id is null
      or exists (
        select 1 from public.study_subjects
        where study_subjects.id = focus_sessions.subject_id
          and study_subjects.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Usuarios atualizam suas proprias sessoes de foco"
  on public.focus_sessions;
create policy "Usuarios atualizam suas proprias sessoes de foco"
  on public.focus_sessions for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      task_id is null
      or exists (
        select 1 from public.tasks
        where tasks.id = focus_sessions.task_id
          and tasks.user_id = auth.uid()
      )
    )
    and (
      subject_id is null
      or exists (
        select 1 from public.study_subjects
        where study_subjects.id = focus_sessions.subject_id
          and study_subjects.user_id = auth.uid()
      )
    )
  );

drop policy if exists "Usuarios excluem suas proprias sessoes de foco"
  on public.focus_sessions;
create policy "Usuarios excluem suas proprias sessoes de foco"
  on public.focus_sessions for delete
  using (auth.uid() = user_id);
