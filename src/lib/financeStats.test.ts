import { describe, expect, it } from 'vitest'
import {
  getMonthKey,
  getPreviousMonthKey,
  groupExpensesByCategory,
  sumConfirmedByTypeAndMonth,
} from './financeStats'

describe('getMonthKey', () => {
  it('extrai ano-mês de uma data', () => {
    expect(getMonthKey('2026-08-15')).toBe('2026-08')
  })
})

describe('getPreviousMonthKey', () => {
  it('retorna o mês anterior dentro do mesmo ano', () => {
    expect(getPreviousMonthKey('2026-08')).toBe('2026-07')
  })

  it('trata virada de ano corretamente', () => {
    expect(getPreviousMonthKey('2026-01')).toBe('2025-12')
  })
})

describe('sumConfirmedByTypeAndMonth', () => {
  const transactions = [
    {
      type: 'income' as const,
      amount_cents: 500000,
      status: 'confirmed' as const,
      due_date: '2026-08-05',
      category_id: null,
    },
    {
      type: 'expense' as const,
      amount_cents: 15000,
      status: 'confirmed' as const,
      due_date: '2026-08-10',
      category_id: 'cat-1',
    },
    {
      type: 'expense' as const,
      amount_cents: 20000,
      status: 'planned' as const,
      due_date: '2026-08-11',
      category_id: 'cat-1',
    },
    {
      type: 'expense' as const,
      amount_cents: 30000,
      status: 'confirmed' as const,
      due_date: '2026-07-20',
      category_id: 'cat-1',
    },
  ]

  it('soma só o tipo e mês pedidos, ignorando não confirmadas', () => {
    expect(sumConfirmedByTypeAndMonth(transactions, 'expense', '2026-08')).toBe(
      15000,
    )
  })

  it('soma receitas separadamente', () => {
    expect(sumConfirmedByTypeAndMonth(transactions, 'income', '2026-08')).toBe(
      500000,
    )
  })

  it('retorna zero para um mês sem transações', () => {
    expect(sumConfirmedByTypeAndMonth(transactions, 'expense', '2026-01')).toBe(
      0,
    )
  })
})

describe('groupExpensesByCategory', () => {
  it('agrupa e ordena do maior para o menor gasto, ignorando outros meses/status', () => {
    const transactions = [
      {
        type: 'expense' as const,
        amount_cents: 10000,
        status: 'confirmed' as const,
        due_date: '2026-08-05',
        category_id: 'alimentacao',
      },
      {
        type: 'expense' as const,
        amount_cents: 5000,
        status: 'confirmed' as const,
        due_date: '2026-08-06',
        category_id: 'alimentacao',
      },
      {
        type: 'expense' as const,
        amount_cents: 30000,
        status: 'confirmed' as const,
        due_date: '2026-08-07',
        category_id: 'moradia',
      },
      {
        type: 'expense' as const,
        amount_cents: 90000,
        status: 'planned' as const,
        due_date: '2026-08-08',
        category_id: 'moradia',
      },
      {
        type: 'income' as const,
        amount_cents: 100000,
        status: 'confirmed' as const,
        due_date: '2026-08-05',
        category_id: null,
      },
      {
        type: 'expense' as const,
        amount_cents: 99999,
        status: 'confirmed' as const,
        due_date: '2026-07-05',
        category_id: 'moradia',
      },
    ]

    expect(groupExpensesByCategory(transactions, '2026-08')).toEqual([
      { categoryId: 'moradia', amountCents: 30000 },
      { categoryId: 'alimentacao', amountCents: 15000 },
    ])
  })

  it('retorna array vazio quando não há despesas confirmadas no mês', () => {
    expect(groupExpensesByCategory([], '2026-08')).toEqual([])
  })
})
