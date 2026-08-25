import {
  BookOpen,
  Brain,
  Briefcase,
  Circle,
  Coffee,
  Droplet,
  Dumbbell,
  Gamepad2,
  Heart,
  Home,
  Moon,
  Music,
  PenTool,
  Sparkles,
  Star,
  Target,
  Utensils,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { FINANCE_CATEGORY_COLORS as CATEGORY_COLORS } from '@/lib/financeCategoryIcons'

export const CATEGORY_ICONS: { name: string; icon: LucideIcon }[] = [
  { name: 'Circle', icon: Circle },
  { name: 'Moon', icon: Moon },
  { name: 'Droplet', icon: Droplet },
  { name: 'Utensils', icon: Utensils },
  { name: 'Dumbbell', icon: Dumbbell },
  { name: 'BookOpen', icon: BookOpen },
  { name: 'Brain', icon: Brain },
  { name: 'Briefcase', icon: Briefcase },
  { name: 'Home', icon: Home },
  { name: 'Heart', icon: Heart },
  { name: 'Star', icon: Star },
  { name: 'Zap', icon: Zap },
  { name: 'Coffee', icon: Coffee },
  { name: 'Music', icon: Music },
  { name: 'PenTool', icon: PenTool },
  { name: 'Target', icon: Target },
  { name: 'Gamepad2', icon: Gamepad2 },
  { name: 'Sparkles', icon: Sparkles },
]

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> =
  Object.fromEntries(CATEGORY_ICONS.map(({ name, icon }) => [name, icon]))

export { CATEGORY_COLORS }
