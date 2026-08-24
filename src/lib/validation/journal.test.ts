import { describe, expect, it } from 'vitest'
import { JOURNAL_NOTES_MAX_LENGTH, journalNotesSchema } from './journal'

describe('journalNotesSchema', () => {
  it('aceita string vazia', () => {
    expect(journalNotesSchema.safeParse('').success).toBe(true)
  })

  it('aceita até o limite de caracteres', () => {
    const notes = 'a'.repeat(JOURNAL_NOTES_MAX_LENGTH)
    expect(journalNotesSchema.safeParse(notes).success).toBe(true)
  })

  it('rejeita acima do limite de caracteres', () => {
    const notes = 'a'.repeat(JOURNAL_NOTES_MAX_LENGTH + 1)
    expect(journalNotesSchema.safeParse(notes).success).toBe(false)
  })
})
