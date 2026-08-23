import { describe, expect, it } from 'vitest'
import {
  centsToBRL,
  centsToInputValue,
  isValidMoneyInput,
  parseMoneyInputToCents,
} from './money'

describe('isValidMoneyInput', () => {
  it('aceita inteiro simples', () => {
    expect(isValidMoneyInput('1500')).toBe(true)
  })

  it('aceita vírgula ou ponto como separador decimal', () => {
    expect(isValidMoneyInput('1500,50')).toBe(true)
    expect(isValidMoneyInput('1500.50')).toBe(true)
  })

  it('aceita um único dígito decimal', () => {
    expect(isValidMoneyInput('1500,5')).toBe(true)
  })

  it('rejeita texto, múltiplos separadores ou mais de 2 casas decimais', () => {
    expect(isValidMoneyInput('abc')).toBe(false)
    expect(isValidMoneyInput('15,00,00')).toBe(false)
    expect(isValidMoneyInput('15,000')).toBe(false)
  })

  it('rejeita negativo por padrão, aceita quando allowNegative=true', () => {
    expect(isValidMoneyInput('-50,00')).toBe(false)
    expect(isValidMoneyInput('-50,00', true)).toBe(true)
  })
})

describe('parseMoneyInputToCents', () => {
  it('converte inteiro sem casas decimais', () => {
    expect(parseMoneyInputToCents('1500')).toBe(150000)
  })

  it('converte com vírgula', () => {
    expect(parseMoneyInputToCents('1500,50')).toBe(150050)
  })

  it('converte com ponto', () => {
    expect(parseMoneyInputToCents('1500.50')).toBe(150050)
  })

  it('completa um único dígito decimal com zero à direita', () => {
    expect(parseMoneyInputToCents('1500,5')).toBe(150050)
  })

  it('converte centavos pequenos corretamente', () => {
    expect(parseMoneyInputToCents('0,01')).toBe(1)
  })

  it('converte valores negativos', () => {
    expect(parseMoneyInputToCents('-50,00')).toBe(-5000)
  })
})

describe('centsToInputValue / round-trip', () => {
  it('converte centavos de volta para string de formulário', () => {
    expect(centsToInputValue(150050)).toBe('1500.50')
  })

  it('faz o round-trip parse -> format -> parse sem perder valor', () => {
    const original = 123456
    const roundTripped = parseMoneyInputToCents(centsToInputValue(original))
    expect(roundTripped).toBe(original)
  })
})

describe('centsToBRL', () => {
  it('formata em reais no padrão pt-BR', () => {
    expect(centsToBRL(150050)).toMatch(/^R\$\s?1\.500,50$/)
  })

  it('formata zero corretamente', () => {
    expect(centsToBRL(0)).toMatch(/^R\$\s?0,00$/)
  })
})
