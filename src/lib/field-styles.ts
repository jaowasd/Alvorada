/**
 * Estilo compartilhado por Input e Select.
 *
 * O foco usa `focus-visible:outline`, o mesmo de `interactiveStates`, em vez
 * do `focus:ring` que existia aqui — antes havia duas linguagens de foco
 * concorrentes no app. Campos de texto casam com :focus-visible mesmo em
 * clique de mouse (os navegadores sempre marcam campos de entrada), então a
 * unificação não custa nada em usabilidade.
 */
export const fieldBase =
  'rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] outline-none transition-[border-color,box-shadow,background-color] duration-[--duration-quick] ease-[--ease-glide] hover:border-[var(--color-text-muted)]/40 focus-visible:border-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-50'

export const fieldError =
  'border-error-500 focus-visible:border-error-500 focus-visible:outline-error-500'
