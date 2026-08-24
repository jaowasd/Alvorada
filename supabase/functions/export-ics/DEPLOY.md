# Deploy da função `export-ics`

Esta é a primeira Supabase Edge Function do projeto. Diferente das migrations
(que você cola direto no SQL Editor do painel), uma Edge Function precisa ser
publicada via Supabase CLI. Passo a passo:

## 1. Rodar a migration da tabela de tokens

Antes de tudo, cole `supabase/migrations/0014_ics_export_tokens.sql` no SQL
Editor do seu projeto Supabase (mesmo processo já usado para as migrations
0001–0013).

## 2. Instalar a Supabase CLI (se ainda não tiver)

```bash
npm install -g supabase
```

## 3. Login e link do projeto

```bash
supabase login
```

Abre o navegador para autorizar. Depois, dentro da pasta do projeto:

```bash
supabase link --project-ref SEU_PROJECT_REF
```

O `PROJECT_REF` é o trecho antes de `.supabase.co` na sua `VITE_SUPABASE_URL`
(ex.: se a URL é `https://abcdefgh.supabase.co`, o ref é `abcdefgh`).

## 4. Deploy da função

```bash
supabase functions deploy export-ics
```

O `supabase/config.toml` já desliga a verificação de JWT só para essa função
(`verify_jwt = false`) — necessário porque apps de calendário externo não
enviam sessão Supabase. Se preferir não usar o `config.toml`, o mesmo efeito
dá pra conseguir com a flag `--no-verify-jwt` no comando acima.

## 5. Testar

A URL final fica:

```
https://SEU_PROJECT_REF.supabase.co/functions/v1/export-ics?token=SEU_TOKEN
```

O token é gerado pelo próprio app, em **Configurações → Exportar para
calendário**. Depois de gerar, copie o link e cole no seu app de calendário
como "assinar calendário por URL" (no Google Calendar: Outras agendas → Por
URL; no Apple Calendar: Arquivo → Nova assinatura de calendário).

## O que a função expõe

Só título + data de vencimento de tarefas não concluídas e transações
financeiras planejadas do usuário dono do token — nada além disso (sem notas,
categoria, valores, ou qualquer outro dado da conta).

## Atualização (migration 0018) — expiração de token

A migration `0018_shareable_tokens_expiration.sql` adiciona a coluna
`expires_at` em `ics_export_tokens`. O código da função já foi atualizado
para checar essa expiração — depois de aplicar a migration, rode
`supabase functions deploy export-ics` de novo para publicar essa mudança
(o deploy anterior não tem a checagem de expiração).
