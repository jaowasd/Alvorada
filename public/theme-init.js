try {
  var storedTheme = localStorage.getItem('alvorada-theme')
  if (storedTheme === 'light' || storedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', storedTheme)
  }
} catch {}
