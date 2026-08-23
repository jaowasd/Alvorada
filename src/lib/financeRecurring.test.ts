import { describe, expect, it } from 'vitest'
import {
  computeMissingOccurrences,
  resolveInstanceAmountCents,
  type RecurringTemplateSchedule,
} from './financeRecurring'

const TODAY = '2026-08-23'

function monthly(
  overrides: Partial<RecurringTemplateSchedule> = {},
): RecurringTemplateSchedule {
  return {
    frequency: 'monthly',
    dayOfMonth: 10,
    weekday: null,
    startDate: '2026-08-10',
    endDate: null,
    lastGeneratedDate: null,
    ...overrides,
  }
}

describe('computeMissingOccurrences - mensal', () => {
  it('gera a primeira ocorrência e a do mês seguinte até hoje + 1 mês', () => {
    expect(computeMissingOccurrences(monthly(), TODAY)).toEqual([
      '2026-08-10',
      '2026-09-10',
    ])
  })

  it('não repete ocorrências já geradas (cursor em last_generated_date)', () => {
    const template = monthly({ lastGeneratedDate: '2026-08-10' })
    expect(computeMissingOccurrences(template, TODAY)).toEqual(['2026-09-10'])
  })

  it('recorrência totalmente em dia não gera nada', () => {
    const template = monthly({ lastGeneratedDate: '2026-09-10' })
    expect(computeMissingOccurrences(template, TODAY)).toEqual([])
  })

  it('respeita end_date, mesmo com horizonte de 1 mês à frente', () => {
    const template = monthly({ endDate: '2026-08-15' })
    expect(computeMissingOccurrences(template, TODAY)).toEqual(['2026-08-10'])
  })

  it('recorrência já gerada até depois do end_date não gera nada', () => {
    const template = monthly({
      startDate: '2026-01-10',
      endDate: '2026-02-01',
      lastGeneratedDate: '2026-02-10',
    })
    expect(computeMissingOccurrences(template, TODAY)).toEqual([])
  })

  it('dia do mês 31 é ajustado para o último dia real do mês (fevereiro)', () => {
    const template = monthly({
      dayOfMonth: 31,
      startDate: '2026-01-31',
    })
    expect(computeMissingOccurrences(template, '2026-01-31')).toEqual([
      '2026-01-31',
      '2026-02-28',
    ])
  })

  it('sem dayOfMonth definido não gera nada', () => {
    const template = monthly({ dayOfMonth: null })
    expect(computeMissingOccurrences(template, TODAY)).toEqual([])
  })
})

describe('computeMissingOccurrences - semanal', () => {
  it('gera só as ocorrências no dia da semana configurado', () => {
    // 2026-08-10 é uma segunda-feira (weekday 1)
    const template: RecurringTemplateSchedule = {
      frequency: 'weekly',
      dayOfMonth: null,
      weekday: 1,
      startDate: '2026-08-10',
      endDate: '2026-08-31',
      lastGeneratedDate: null,
    }
    expect(computeMissingOccurrences(template, '2026-08-10')).toEqual([
      '2026-08-10',
      '2026-08-17',
      '2026-08-24',
      '2026-08-31',
    ])
  })

  it('sem weekday definido não gera nada', () => {
    const template: RecurringTemplateSchedule = {
      frequency: 'weekly',
      dayOfMonth: null,
      weekday: null,
      startDate: '2026-08-10',
      endDate: null,
      lastGeneratedDate: null,
    }
    expect(computeMissingOccurrences(template, TODAY)).toEqual([])
  })
})

describe('resolveInstanceAmountCents', () => {
  it('usa o valor do template quando não é de valor variável', () => {
    expect(
      resolveInstanceAmountCents(
        { amountCents: 15000, isVariableAmount: false },
        20000,
      ),
    ).toBe(15000)
  })

  it('usa o último valor conhecido quando é de valor variável', () => {
    expect(
      resolveInstanceAmountCents(
        { amountCents: 15000, isVariableAmount: true },
        20000,
      ),
    ).toBe(20000)
  })

  it('cai para o valor do template quando não há histórico ainda', () => {
    expect(
      resolveInstanceAmountCents(
        { amountCents: 15000, isVariableAmount: true },
        null,
      ),
    ).toBe(15000)
  })
})
