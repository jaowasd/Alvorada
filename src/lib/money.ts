const POSITIVE_MONEY_PATTERN = /^\d+([.,]\d{1,2})?$/
const SIGNED_MONEY_PATTERN = /^-?\d+([.,]\d{1,2})?$/

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Valida um valor digitado (ex.: "150,50" ou "150.5"); allowNegative para saldo inicial de conta. */
export function isValidMoneyInput(
  value: string,
  allowNegative = false,
): boolean {
  const pattern = allowNegative ? SIGNED_MONEY_PATTERN : POSITIVE_MONEY_PATTERN
  return pattern.test(value.trim())
}

/** Converte um valor digitado (vírgula ou ponto como separador decimal) em centavos inteiros. */
export function parseMoneyInputToCents(value: string): number {
  const trimmed = value.trim()
  const negative = trimmed.startsWith('-')
  const unsigned = negative ? trimmed.slice(1) : trimmed
  const [reaisPart, centsPartRaw = ''] = unsigned.replace(',', '.').split('.')
  const reais = reaisPart === '' ? 0 : Number(reaisPart)
  const cents = Number(centsPartRaw.padEnd(2, '0').slice(0, 2))
  const total = reais * 100 + cents
  return negative ? -total : total
}

/** Centavos -> string de formulário ("1500.50"), pronta para reabrir em um input. */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2)
}

/** Centavos -> moeda formatada em pt-BR (ex.: "R$ 1.500,50"). */
export function centsToBRL(cents: number): string {
  return currencyFormatter.format(cents / 100)
}
