import type { FinanceAccount, FinanceTransaction } from '@/types/database'

type BalanceTransaction = Pick<
  FinanceTransaction,
  'type' | 'amount_cents' | 'account_id' | 'related_account_id' | 'status'
>

type BalanceAccount = Pick<FinanceAccount, 'id' | 'initial_balance_cents'>

interface BalanceOptions {
  /** Inclui transações com status "planned" (saldo previsto) além de "confirmed". */
  includePlanned?: boolean
}

/**
 * Saldo de uma conta = saldo inicial + receitas - despesas + transferências
 * recebidas - transferências enviadas, considerando só transações
 * confirmadas por padrão (saldo previsto inclui as planejadas também).
 */
export function calculateAccountBalanceCents(
  account: BalanceAccount,
  transactions: BalanceTransaction[],
  options: BalanceOptions = {},
): number {
  const includePlanned = options.includePlanned ?? false
  let balance = account.initial_balance_cents

  for (const transaction of transactions) {
    if (!includePlanned && transaction.status !== 'confirmed') continue

    if (transaction.account_id === account.id) {
      if (transaction.type === 'income') balance += transaction.amount_cents
      else balance -= transaction.amount_cents
      // 'expense' e 'transfer' saindo da conta ambos subtraem
    }
    if (
      transaction.type === 'transfer' &&
      transaction.related_account_id === account.id
    ) {
      balance += transaction.amount_cents
    }
  }

  return balance
}

/** Soma o saldo das contas marcadas para entrar no total (include_in_total). */
export function calculateTotalBalanceCents(
  accounts: (BalanceAccount & { include_in_total: boolean })[],
  transactions: BalanceTransaction[],
  options: BalanceOptions = {},
): number {
  return accounts
    .filter((account) => account.include_in_total)
    .reduce(
      (sum, account) =>
        sum + calculateAccountBalanceCents(account, transactions, options),
      0,
    )
}
