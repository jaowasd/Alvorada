import {
  addDays,
  differenceInCalendarDays,
  endOfWeek,
  parseISO,
  startOfWeek,
  subWeeks,
} from 'date-fns'
import { getLocalDateString } from '@/lib/date'
import type {
  FocusSession,
  StudyExamRecord,
  StudySubject,
} from '@/types/database'

/**
 * Subconjunto estrutural de FocusSession: as funções aqui só dependem desses
 * campos, o que mantém os testes legíveis e deixa explícito que `task_id`
 * nunca é dimensão de agregação (uma sessão com matéria E tarefa conta uma
 * vez só, pela matéria).
 */
export type StudySessionLike = Pick<
  FocusSession,
  'subject_id' | 'duration_minutes' | 'started_at' | 'completed_at'
>

/** Sessão interrompida (completed_at nulo) não vale minuto nenhum. */
function isCompleted(session: StudySessionLike): boolean {
  return session.completed_at !== null
}

/** Data local (não UTC) em que a sessão começou. */
function sessionDate(session: StudySessionLike): string {
  return getLocalDateString(new Date(session.started_at))
}

function isInRange(date: string, from?: string, to?: string): boolean {
  if (from && date < from) return false
  if (to && date > to) return false
  return true
}

/** Datas locais distintas com pelo menos uma sessão concluída, em ordem. */
export function getStudiedDates(sessions: StudySessionLike[]): string[] {
  const dates = new Set<string>()
  for (const session of sessions) {
    if (isCompleted(session)) dates.add(sessionDate(session))
  }
  return [...dates].sort()
}

/** Soma os minutos das sessões concluídas no intervalo local [from, to]. */
export function sumStudyMinutes(
  sessions: StudySessionLike[],
  from?: string,
  to?: string,
): number {
  return sessions.reduce((total, session) => {
    if (!isCompleted(session)) return total
    if (!isInRange(sessionDate(session), from, to)) return total
    return total + session.duration_minutes
  }, 0)
}

/** Minutos concluídos por matéria. A chave `null` agrupa "Sem matéria". */
export function computeMinutesBySubject(
  sessions: StudySessionLike[],
  from?: string,
  to?: string,
): Map<string | null, number> {
  const totals = new Map<string | null, number>()
  for (const session of sessions) {
    if (!isCompleted(session)) continue
    if (!isInRange(sessionDate(session), from, to)) continue
    const key = session.subject_id
    totals.set(key, (totals.get(key) ?? 0) + session.duration_minutes)
  }
  return totals
}

/** Minutos concluídos por dia local, com zero nos dias sem sessão. */
export function computeMinutesByDate(
  sessions: StudySessionLike[],
  from: string,
  to: string,
): Map<string, number> {
  const totals = new Map<string, number>()
  let cursor = new Date(`${from}T00:00:00`)
  const end = new Date(`${to}T00:00:00`)
  while (cursor <= end) {
    totals.set(getLocalDateString(cursor), 0)
    cursor = addDays(cursor, 1)
  }

  for (const session of sessions) {
    if (!isCompleted(session)) continue
    const date = sessionDate(session)
    if (!totals.has(date)) continue
    totals.set(date, (totals.get(date) ?? 0) + session.duration_minutes)
  }
  return totals
}

/**
 * Semana de segunda a domingo. Divergência consciente do resto do repo (que
 * usa `weekStartsOn: 0`): a semana de estudo de quem presta concurso começa
 * na segunda, e o fim de semana é reforço, não o começo do ciclo.
 */
export function getWeekRange(date: string): { start: string; end: string } {
  const reference = new Date(`${date}T00:00:00`)
  return {
    start: getLocalDateString(startOfWeek(reference, { weekStartsOn: 1 })),
    end: getLocalDateString(endOfWeek(reference, { weekStartsOn: 1 })),
  }
}

export interface SubjectWeeklyProgress {
  subjectId: string
  minutes: number
  goalMinutes: number | null
  /** `null` quando a matéria não tem meta — não é 0%, é "não se aplica". */
  percent: number | null
}

/** Progresso semanal por matéria, da que mais recebeu tempo para a que menos. */
export function computeWeeklyProgress(
  subjects: Pick<StudySubject, 'id' | 'weekly_goal_minutes'>[],
  sessions: StudySessionLike[],
  weekStart: string,
  weekEnd: string,
): SubjectWeeklyProgress[] {
  const minutesBySubject = computeMinutesBySubject(sessions, weekStart, weekEnd)

  return subjects
    .map((subject) => {
      const minutes = minutesBySubject.get(subject.id) ?? 0
      const goalMinutes = subject.weekly_goal_minutes
      return {
        subjectId: subject.id,
        minutes,
        goalMinutes,
        percent: goalMinutes ? Math.round((minutes / goalMinutes) * 100) : null,
      }
    })
    .sort((a, b) => b.minutes - a.minutes)
}

/** Média de minutos por dia corrido do intervalo (inclui dias sem estudo). */
export function computeDailyAverageMinutes(
  sessions: StudySessionLike[],
  from: string,
  to: string,
): number {
  const days = differenceInCalendarDays(parseISO(to), parseISO(from)) + 1
  if (days <= 0) return 0
  return Math.round(sumStudyMinutes(sessions, from, to) / days)
}

/** 0 -> "0min", 45 -> "45min", 120 -> "2h", 125 -> "2h05". */
export function formatStudyMinutes(totalMinutes: number): string {
  const safe = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(safe / 60)
  const minutes = safe % 60
  if (hours === 0) return `${minutes}min`
  if (minutes === 0) return `${hours}h`
  return `${hours}h${String(minutes).padStart(2, '0')}`
}

export interface ExamAccuracy {
  correct: number
  total: number
  /** `null` quando não há questão nenhuma — nunca NaN. */
  percent: number | null
}

export function computeExamAccuracy(
  records: Pick<StudyExamRecord, 'correct_count' | 'total_questions'>[],
): ExamAccuracy {
  let correct = 0
  let total = 0
  for (const record of records) {
    correct += record.correct_count
    total += record.total_questions
  }
  return {
    correct,
    total,
    percent: total > 0 ? Math.round((correct / total) * 100) : null,
  }
}

/** Aproveitamento agrupado por matéria; chave `null` = "Sem matéria". */
export function computeAccuracyBySubject(
  records: Pick<
    StudyExamRecord,
    'subject_id' | 'correct_count' | 'total_questions'
  >[],
): Map<string | null, ExamAccuracy> {
  const grouped = new Map<string | null, ExamAccuracy>()
  for (const record of records) {
    const current = grouped.get(record.subject_id) ?? {
      correct: 0,
      total: 0,
      percent: null,
    }
    current.correct += record.correct_count
    current.total += record.total_questions
    current.percent =
      current.total > 0
        ? Math.round((current.correct / current.total) * 100)
        : null
    grouped.set(record.subject_id, current)
  }
  return grouped
}

/** Dias corridos até a prova. Negativo se já passou, `null` se não definida. */
export function daysUntilExam(
  examDate: string | null,
  today: string,
): number | null {
  if (!examDate) return null
  return differenceInCalendarDays(parseISO(examDate), parseISO(today))
}

/**
 * Alimenta o <ConsistencyHeatmap> com "% da meta diária cumprida" no lugar do
 * "% da rotina concluída" que o Dashboard usa — mesma escala, outro dado.
 * Sem meta definida, cai num alvo de 60 min/dia só para a escala existir.
 */
export function buildStudyConsistencyMap(
  sessions: StudySessionLike[],
  dailyTargetMinutes: number,
  weeksCount: number,
  today: string,
): Map<string, number | null> {
  const todayDate = new Date(`${today}T00:00:00`)
  const from = getLocalDateString(
    startOfWeek(subWeeks(todayDate, weeksCount - 1), { weekStartsOn: 0 }),
  )
  const minutesByDate = computeMinutesByDate(sessions, from, today)
  const target = dailyTargetMinutes > 0 ? dailyTargetMinutes : 60

  const map = new Map<string, number | null>()
  for (const [date, minutes] of minutesByDate) {
    map.set(date, minutes === 0 ? 0 : Math.round((minutes / target) * 100))
  }
  return map
}
