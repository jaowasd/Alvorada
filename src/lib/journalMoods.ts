import { Angry, Frown, Laugh, Meh, Smile, type LucideIcon } from 'lucide-react'
import type { JournalMood } from '@/types/database'

export const MOOD_OPTIONS: {
  value: JournalMood
  label: string
  icon: LucideIcon
}[] = [
  { value: 'otimo', label: 'Ótimo', icon: Laugh },
  { value: 'bom', label: 'Bom', icon: Smile },
  { value: 'neutro', label: 'Neutro', icon: Meh },
  { value: 'dificil', label: 'Difícil', icon: Frown },
  { value: 'pesado', label: 'Pesado', icon: Angry },
]
