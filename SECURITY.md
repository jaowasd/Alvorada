# SECURITY.md — decisões de segurança do Alvorada

Referência das decisões tomadas nas rodadas de hardening do projeto. Não é
uma auditoria completa — documenta escolhas que não são óbvias só lendo o
código.

## Cabeçalhos HTTP (`vercel.json`)

- `style-src` precisa de `'unsafe-inline'`: o stylesheet do Google Fonts e
  bibliotecas de animação (framer-motion, recharts) injetam `style` inline
  em runtime. Não há como evitar isso sem reescrever essas libs — é uma
  concessão aceita, não um descuido. `script-src` continua estrito (`'self'`,
  sem `'unsafe-inline'`) porque o único script inline que existia (init de
  tema, evita flash) foi movido para `public/theme-init.js`.
- `connect-src` libera `https://*.supabase.co` e `wss://*.supabase.co`
  (subdomínio varia por projeto Supabase, não dá pra fixar um valor único
  no `vercel.json`).
- `Strict-Transport-Security: max-age=63072000; includeSubDomains` — força
  HTTPS por 2 anos, incluindo subdomínios. **Sem `preload`**, de propósito:
  `preload` exige submeter o domínio em hstspreload.org e é difícil de
  reverter depois que os navegadores aceitam. `max-age`+`includeSubDomains`
  já dão a proteção real (todo acesso subsequente força HTTPS) e ficam
  reversíveis a qualquer momento.
- `Permissions-Policy` ampliado para também bloquear `payment`, `usb` e
  `interest-cohort`, além de `camera`/`microphone`/`geolocation` já
  bloqueados.

## Controle de acesso entre tabelas (ownership checks)

- Checagem de foreign key / unique constraint no Postgres **sempre ignora
  RLS** — uma FK apontando pra uma linha existente não prova que o usuário
  autenticado tem permissão de enxergar/possuir essa linha. Por isso toda
  policy de INSERT (e UPDATE, quando a coluna é editável) que grava uma FK
  pra outra tabela pertencente a um usuário precisa validar a posse
  explicitamente, com um `exists (select 1 from <tabela pai> where
  <pai>.id = <filha>.fk_id and <pai>.user_id = auth.uid())` — checar só
  `auth.uid() = user_id` na própria linha não é suficiente.
- Esse padrão já existia em `habit_frequency_days` e `routine_steps` desde
  o início; a migration `0019` estendeu ele pra `shared_routine_links`
  (prioridade alta — o gap ali era explorável via `get_shared_routine()`,
  função pública) e mais 8 tabelas (`routine_step_completions`,
  `habit_completions`, `finance_transactions`,
  `finance_recurring_transactions`, `reminders`, `goal_progress_entries`,
  `focus_sessions`, `finance_budgets` — defesa em profundidade, exigem
  usuário autenticado, não expostas publicamente).
- **Qualquer migration nova que adicione uma coluna de foreign key numa
  tabela com RLS precisa repetir esse padrão** — é o jeito de não
  reintroduzir esse mesmo gap.

## Tokens de acesso público (rotina compartilhada e `.ics`)

- `shared_routine_links` e `ics_export_tokens` ganharam `expires_at`
  (migration `0018`), opcional na hora de gerar o link/token (nunca/7/30/90
  dias). `null` = nunca expira, mesmo comportamento de antes.
- **Rate limiting foi avaliado e descartado por enquanto.** Os tokens são
  `crypto.randomUUID()` (122 bits de entropia) — força bruta é inviável. O
  risco real seria um link vazado sendo martelado por terceiros, e isso já
  é mitigado pela expiração acima (o dono revoga ou deixa expirar). Um
  contador com reset diário adicionaria superfície de bug (fuso horário,
  concorrência de upsert) desproporcional pro contexto atual (app pessoal,
  poucos usuários). Se o app crescer a ponto de isso importar, o desenho
  fica pronto pra retomar: colunas `request_count`/`count_reset_at` em
  `ics_export_tokens` (é a única das duas exposta a poll automático de
  terceiros), incrementadas na própria Edge Function antes de responder.
- O campo `SUMMARY` do `.ics` gerado (`supabase/functions/export-ics`)
  escapa `\r`/`\n` além de `,`/`;`/`\` (RFC 5545), pra um título/descrição
  com quebra de linha embutida (só possível via chamada direta à API,
  contornando o `<Input>` de uma linha) não injetar linhas extras no
  calendário gerado.

## Validação de tamanho

`journal_entries.notes` (2000 chars), `reminders.message` (500) e
`reminders.custom_label` (120) — antes sem limite em nenhuma camada. Agora
reforçado em 3 camadas: `maxLength` no input, Zod no cliente
(`src/lib/validation/journal.ts` e `reminder.ts`), `check` no banco
(migration `0017`) como última linha de defesa.

A migration `0020` estendeu o mesmo padrão de 3 camadas pras colunas de
texto livre restantes que ainda não tinham limite em nenhuma camada:
`profiles.display_name` (30) / `avatar_url` (2048), `tasks.title` (120) /
`notes` (500), `routines.name` (120), `routine_steps.title` (120) /
`notes` (500), `habits.name` (120) / `notes` (500),
`finance_categories.name` (60), `finance_accounts.name` (60),
`finance_transactions.description` (120) / `notes` (500),
`finance_recurring_transactions.description` (120), `goals.name` (120) /
`unit` (30), `goal_progress_entries.notes` (2000) e
`focus_sessions.label` (120). Onde já existia Zod client-side, o valor do
`check` no banco é o mesmo — o objetivo era o banco concordar com a
validação que já existia, não escolher limites novos.

## Senha e autenticação

- Política de senha hoje é só `min(8)` (`src/lib/validation/auth.ts`), sem
  regra de complexidade. **Decisão consciente, não descuido**: app pessoal,
  poucos usuários — o custo de UX de uma política mais rígida não se paga
  no contexto atual. Revisar se o app crescer.
- Sessão (access/refresh token) fica em `localStorage` via supabase-js
  (comportamento padrão do client, não customizado). É um trade-off
  inerente da arquitetura — mitigado pela CSP estrita já documentada acima
  (`script-src 'self'`, sem `unsafe-inline`/`unsafe-eval`) e pela ausência
  confirmada de qualquer sink de XSS no app (`dangerouslySetInnerHTML`,
  `innerHTML`, `eval`, `new Function`) — sem XSS não há como um script de
  terceiro ler o `localStorage`.
- Rate limiting de tentativas de login é responsabilidade do Supabase Auth
  (GoTrue), não deste repositório — `supabase/config.toml` não tem seção
  `[auth]`, então nada disso é código versionado; os ajustes vivem só no
  Dashboard do projeto Supabase. Checklist do que confirmar lá
  periodicamente: confirmação de e-mail obrigatória antes de produção (ver
  aviso em `supabase/README.md`), expiração de JWT configurada, rate limit
  de login/signup habilitado.
