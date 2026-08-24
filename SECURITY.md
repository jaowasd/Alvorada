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

## Validação de tamanho

`journal_entries.notes` (2000 chars), `reminders.message` (500) e
`reminders.custom_label` (120) — antes sem limite em nenhuma camada. Agora
reforçado em 3 camadas: `maxLength` no input, Zod no cliente
(`src/lib/validation/journal.ts` e `reminder.ts`), `check` no banco
(migration `0017`) como última linha de defesa.
