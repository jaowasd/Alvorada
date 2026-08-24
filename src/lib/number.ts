const numberFormatter = new Intl.NumberFormat('pt-BR')

/** Formata um número inteiro com separador de milhar no padrão pt-BR (ex.: 30523 -> "30.523"). */
export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}
