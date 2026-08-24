export interface AchievementInput {
  routineBestStreak: number
  completedTasksCount: number
  habitCompletionsCount: number
  journalEntriesCount: number
}

export interface AchievementProgress {
  key: string
  label: string
  description: string
  current: number
  target: number
  achieved: boolean
}

interface AchievementDef {
  key: string
  label: string
  description: string
  target: number
  current: (input: AchievementInput) => number
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    key: 'routine_streak_7',
    label: 'Uma semana de rotina',
    description: 'Complete a rotina matinal 7 dias seguidos.',
    target: 7,
    current: (input) => input.routineBestStreak,
  },
  {
    key: 'routine_streak_30',
    label: 'Um mês de rotina',
    description: 'Complete a rotina matinal 30 dias seguidos.',
    target: 30,
    current: (input) => input.routineBestStreak,
  },
  {
    key: 'tasks_10',
    label: 'Primeiras 10 tarefas',
    description: 'Conclua 10 tarefas.',
    target: 10,
    current: (input) => input.completedTasksCount,
  },
  {
    key: 'tasks_100',
    label: '100 tarefas concluídas',
    description: 'Conclua 100 tarefas.',
    target: 100,
    current: (input) => input.completedTasksCount,
  },
  {
    key: 'habits_50',
    label: '50 hábitos concluídos',
    description: 'Marque 50 hábitos como concluídos.',
    target: 50,
    current: (input) => input.habitCompletionsCount,
  },
  {
    key: 'habits_200',
    label: '200 hábitos concluídos',
    description: 'Marque 200 hábitos como concluídos.',
    target: 200,
    current: (input) => input.habitCompletionsCount,
  },
  {
    key: 'journal_1',
    label: 'Primeira reflexão',
    description: 'Registre como foi seu dia pela primeira vez.',
    target: 1,
    current: (input) => input.journalEntriesCount,
  },
  {
    key: 'journal_7',
    label: 'Uma semana de diário',
    description: 'Registre como foi seu dia 7 vezes.',
    target: 7,
    current: (input) => input.journalEntriesCount,
  },
]

export function computeAchievements(
  input: AchievementInput,
): AchievementProgress[] {
  return ACHIEVEMENT_DEFS.map((def) => {
    const rawCurrent = def.current(input)
    return {
      key: def.key,
      label: def.label,
      description: def.description,
      target: def.target,
      current: Math.min(rawCurrent, def.target),
      achieved: rawCurrent >= def.target,
    }
  })
}
