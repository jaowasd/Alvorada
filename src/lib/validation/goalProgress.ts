import { z } from 'zod'

export const GOAL_PROGRESS_NOTES_MAX_LENGTH = 2000

export const goalProgressNotesSchema = z
  .string()
  .trim()
  .max(GOAL_PROGRESS_NOTES_MAX_LENGTH, 'Nota muito longa')
