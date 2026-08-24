import { z } from 'zod'

export const JOURNAL_NOTES_MAX_LENGTH = 2000

export const journalNotesSchema = z
  .string()
  .max(JOURNAL_NOTES_MAX_LENGTH, 'Nota muito longa')
