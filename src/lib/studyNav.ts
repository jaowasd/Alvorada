/**
 * Sub-rotas de Estudos, num só lugar: a sidebar (AppShell) e a barra de abas
 * do mobile (EstudosSubNav) leem daqui. Finanças duplica essa lista entre os
 * dois arquivos — o módulo novo não repete o erro.
 */
export interface StudySubNavItem {
  to: string
  label: string
  end?: boolean
}

export const STUDY_SUB_ITEMS: StudySubNavItem[] = [
  { to: '/app/estudos', label: 'Visão geral', end: true },
  { to: '/app/estudos/materias', label: 'Matérias', end: false },
  { to: '/app/estudos/sessoes', label: 'Sessões', end: false },
  { to: '/app/estudos/provas', label: 'Provas', end: false },
]
