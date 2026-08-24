// Edge Function pública: gera um arquivo .ics dinâmico com os prazos de
// tarefas e vencimentos financeiros do usuário, para "assinar" a URL num
// app de calendário externo (Google Calendar, Apple Calendar etc).
//
// Autenticação por token de longa duração (tabela ics_export_tokens), não
// por sessão Supabase — apps de calendário fazem GET periódico sem login
// interativo, então não têm como enviar um JWT de sessão. Por isso esta
// função precisa rodar com verificação de JWT desligada (ver
// supabase/config.toml) e usa a service role key para ler os dados do
// usuário já identificado pelo token.
//
// Deploy: ver supabase/functions/export-ics/DEPLOY.md

import { createClient } from 'npm:@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface IcsEvent {
  uid: string
  title: string
  date: string // YYYY-MM-DD
}

function formatIcsDate(date: string): string {
  return date.replace(/-/g, '')
}

function escapeIcsText(text: string): string {
  return text.replace(/([,;\\])/g, '\\$1')
}

function buildIcsCalendar(events: IcsEvent[]): string {
  const stamp =
    new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Alvorada//Exportacao de prazos//PT-BR',
    'CALSCALE:GREGORIAN',
  ]
  for (const event of events) {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}@alvorada`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${formatIcsDate(event.date)}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const token = url.searchParams.get('token')

  if (!token) {
    return new Response('Token ausente.', { status: 400 })
  }

  const client = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

  const { data: tokenRow } = await client
    .from('ics_export_tokens')
    .select('user_id')
    .eq('token', token)
    .maybeSingle()

  if (!tokenRow) {
    return new Response('Link inválido ou revogado.', { status: 404 })
  }

  const [{ data: tasks }, { data: transactions }] = await Promise.all([
    client
      .from('tasks')
      .select('id, title, due_date')
      .eq('user_id', tokenRow.user_id)
      .eq('is_completed', false)
      .is('deleted_at', null)
      .not('due_date', 'is', null),
    client
      .from('finance_transactions')
      .select('id, description, due_date')
      .eq('user_id', tokenRow.user_id)
      .eq('status', 'planned')
      .is('deleted_at', null),
  ])

  const events: IcsEvent[] = [
    ...(tasks ?? []).map(
      (task: { id: string; title: string; due_date: string }) => ({
        uid: `task-${task.id}`,
        title: task.title,
        date: task.due_date,
      }),
    ),
    ...(transactions ?? []).map(
      (transaction: { id: string; description: string; due_date: string }) => ({
        uid: `finance-${transaction.id}`,
        title: transaction.description,
        date: transaction.due_date,
      }),
    ),
  ]

  return new Response(buildIcsCalendar(events), {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
})
