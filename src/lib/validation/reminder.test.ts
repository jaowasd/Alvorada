import { describe, expect, it } from 'vitest'
import {
  customReminderFormSchema,
  REMINDER_LABEL_MAX_LENGTH,
  REMINDER_MESSAGE_MAX_LENGTH,
} from './reminder'

describe('customReminderFormSchema', () => {
  it('aceita um rótulo e data válidos, sem mensagem', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'none',
      label: 'Revisão semanal',
      remindAt: '2026-09-01',
      message: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejeita rótulo vazio', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'none',
      label: '  ',
      remindAt: '2026-09-01',
      message: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita rótulo acima do limite de caracteres', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'none',
      label: 'a'.repeat(REMINDER_LABEL_MAX_LENGTH + 1),
      remindAt: '2026-09-01',
      message: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita mensagem acima do limite de caracteres', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'none',
      label: 'Revisão semanal',
      remindAt: '2026-09-01',
      message: 'a'.repeat(REMINDER_MESSAGE_MAX_LENGTH + 1),
    })
    expect(result.success).toBe(false)
  })

  it('rejeita data ausente', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'none',
      label: 'Revisão semanal',
      remindAt: '',
      message: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejeita vinculo sem item selecionado', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'task',
      linkedId: '',
      remindAt: '2026-09-01',
      message: '',
    })
    expect(result.success).toBe(false)
  })

  it('aceita vinculo com item selecionado, sem rótulo', () => {
    const result = customReminderFormSchema.safeParse({
      linkType: 'task',
      linkedId: 'abc-123',
      remindAt: '2026-09-01',
      message: '',
    })
    expect(result.success).toBe(true)
  })
})
