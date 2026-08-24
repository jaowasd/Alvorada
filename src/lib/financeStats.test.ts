import { describe, expect, it } from 'vitest'
import {
  buildTransactionsCsv,
  computeMonthlyTrend,
  diffCategoryBreakdown,
  getLastNMonthKeys,
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

describe('getLastNMonthKeys', () => {
  it('gera os últimos N meses terminando no informado, do mais antigo pro mais recente', () => {
    expect(getLastNMonthKeys('2026-03', 4)).toEqual([
      '2025-12',
      '2026-01',
      '2026-02',
      '2026-03',
    ])
  })

  it('com count 1 retorna só o próprio mês', () => {
    expect(getLastNMonthKeys('2026-08', 1)).toEqual(['2026-08'])
  })
})

describe('computeMonthlyTrend', () => {
  it('soma receitas e despesas confirmadas por mês, na ordem dos monthKeys', () => {
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
        amount_cents: 30000,
        status: 'confirmed' as const,
        due_date: '2026-07-10',
        category_id: 'cat-1',
      },
    ]
    expect(computeMonthlyTrend(transactions, ['2026-07', '2026-08'])).toEqual([
      { monthKey: '2026-07', incomeCents: 0, expenseCents: 30000 },
      { monthKey: '2026-08', incomeCents: 500000, expenseCents: 15000 },
    ])
  })
})

describe('diffCategoryBreakdown', () => {
  it('compara o gasto por categoria entre dois meses, unindo categorias de qualquer um dos dois', () => {
    const current = [
      { categoryId: 'moradia', amountCents: 30000 },
      { categoryId: 'lazer', amountCents: 5000 },
    ]
    const previous = [
      { categoryId: 'moradia', amountCents: 20000 },
      { categoryId: 'alimentacao', amountCents: 10000 },
    ]
    expect(diffCategoryBreakdown(current, previous)).toEqual([
      {
        categoryId: 'moradia',
        currentCents: 30000,
        previousCents: 20000,
        deltaCents: 10000,
      },
      {
        categoryId: 'lazer',
        currentCents: 5000,
        previousCents: 0,
        deltaCents: 5000,
      },
      {
        categoryId: 'alimentacao',
        currentCents: 0,
        previousCents: 10000,
        deltaCents: -10000,
      },
    ])
  })
})

describe('buildTransactionsCsv', () => {
  it('monta cabeçalho e linhas com nomes de categoria/conta resolvidos', () => {
    const csv = buildTransactionsCsv(
      [
        {
          description: 'Mercado',
          amount_cents: 15050,
          type: 'expense',
          status: 'confirmed',
          due_date: '2026-08-10',
          category_id: 'cat-1',
          account_id: 'acc-1',
        },
      ],
      new Map([['cat-1', 'Alimentação']]),
      new Map([['acc-1', 'Carteira']]),
    )
    const lines = csv.split('\n')
    expect(lines[0]).toBe(
      'Data;Descrição;Categoria;Conta;Tipo;Status;Valor (R$)',
    )
    expect(lines[1]).toBe(
      '2026-08-10;Mercado;Alimentação;Carteira;Despesa;Confirmada;150,50',
    )
  })

  it('escapa campos com ponto e vírgula ou aspas', () => {
    const csv = buildTransactionsCsv(
      [
        {
          description: 'Presente; "aniversário"',
          amount_cents: 1000,
          type: 'expense',
          status: 'planned',
          due_date: '2026-08-11',
          category_id: null,
          account_id: 'acc-1',
        },
      ],
      new Map(),
      new Map([['acc-1', 'Carteira']]),
    )
    const lines = csv.split('\n')
    expect(lines[1]).toBe(
      '2026-08-11;"Presente; ""aniversário""";;Carteira;Despesa;Planejada;10,00',
    )
  })
})
