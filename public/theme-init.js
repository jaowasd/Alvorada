// Roda antes da primeira pintura (script clássico e bloqueante no <head>):
// tema e fase do dia precisam estar no <html> antes do CSS aplicar, senão
// pisca. Nenhuma dependência, nenhum import — mantém assim.
try {
  var storedTheme = localStorage.getItem('alvorada-theme')
  if (storedTheme === 'light' || storedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', storedTheme)
  }
} catch {}

// Precisa espelhar resolveDaypart() em src/lib/daypart.ts.
try {
  var hour = new Date().getHours()
  var daypart =
    hour >= 5 && hour < 10
      ? 'dawn'
      : hour >= 10 && hour < 17
        ? 'day'
        : hour >= 17 && hour < 20
          ? 'dusk'
          : 'night'
  document.documentElement.setAttribute('data-daypart', daypart)
} catch {}
