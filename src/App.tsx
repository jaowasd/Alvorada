function App() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-bg)] px-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">
          Alvorada
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Base do projeto configurada. Próximo passo: design system e landing
          page.
        </p>
        <button
          type="button"
          className="from-primary-500 to-accent-500 mt-6 rounded-lg bg-gradient-to-r px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
        >
          Começar
        </button>
      </div>
    </main>
  )
}

export default App
