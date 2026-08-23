import { describe, expect, it } from 'vitest'
import {
  calculateAccountBalanceCents,
  calculateTotalBalanceCents,
} from './financeBalance'

const CHECKING = { id: 'checking', initial_balance_cents: 100000 }
const SAVINGS = { id: 'savings', initial_balance_cents: 50000 }

describe('calculateAccountBalanceCents', () => {
  it('soma receitas confirmadas', () => {
    const balance = calculateAccountBalanceCents(CHECKING, [
      {
        type: 'income',
        amount_cents: 20000,
        account_id: 'checking',
        related_account_id: null,
        status: 'confirmed',
      },
    ])
    expect(balance).toBe(120000)
  })

  it('subtrai despesas confirmadas', () => {
    const balance = calculateAccountBalanceCents(CHECKING, [
      {
        type: 'expense',
        amount_cents: 30000,
        account_id: 'checking',
        related_account_id: null,
        status: 'confirmed',
      },
    ])
    expect(balance).toBe(70000)
  })

  it('ignora transações de outra conta', () => {
    const balance = calculateAccountBalanceCents(CHECKING, [
      {
        type: 'expense',
        amount_cents: 30000,
        account_id: 'savings',
        related_account_id: null,
        status: 'confirmed',
      },
    ])
    expect(balance).toBe(100000)
  })

  it('ignora transações não confirmadas por padrão', () => {
    const balance = calculateAccountBalanceCents(CHECKING, [
      {
        type: 'income',
        amount_cents: 20000,
        account_id: 'checking',
        related_account_id: null,
        status: 'planned',
      },
    ])
    expect(balance).toBe(100000)
  })

  it('inclui transações previstas quando includePlanned=true', () => {
    const balance = calculateAccountBalanceCents(
      CHECKING,
      [
        {
          type: 'income',
          amount_cents: 20000,
          account_id: 'checking',
          related_account_id: null,
          status: 'planned',
        },
      ],
      { includePlanned: true },
    )
    expect(balance).toBe(120000)
  })

  it('transferência sai da conta de origem', () => {
    const balance = calculateAccountBalanceCents(CHECKING, [
      {
        type: 'transfer',
        amount_cents: 10000,
        account_id: 'checking',
        related_account_id: 'savings',
        status: 'confirmed',
      },
    ])
    expect(balance).toBe(90000)
  })

  it('transferência entra na conta de destino', () => {
    const balance = calculateAccountBalanceCents(SAVINGS, [
      {
        type: 'transfer',
        amount_cents: 10000,
        account_id: 'checking',
        related_account_id: 'savings',
        status: 'confirmed',
      },
    ])
    expect(balance).toBe(60000)
  })
})

describe('calculateTotalBalanceCents', () => {
  it('soma só as contas com include_in_total=true', () => {
    const total = calculateTotalBalanceCents(
      [
        { ...CHECKING, include_in_total: true },
        { ...SAVINGS, include_in_total: false },
      ],
      [],
    )
    expect(total).toBe(100000)
  })

  it('uma transferência entre duas contas incluídas não muda o total', () => {
    const total = calculateTotalBalanceCents(
      [
        { ...CHECKING, include_in_total: true },
        { ...SAVINGS, include_in_total: true },
      ],
      [
        {
          type: 'transfer',
          amount_cents: 10000,
          account_id: 'checking',
          related_account_id: 'savings',
          status: 'confirmed',
        },
      ],
    )
    expect(total).toBe(150000)
  })
})
