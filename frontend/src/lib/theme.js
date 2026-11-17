export function applyUserTheme(theme) {
  const selectedTheme = ['Light', 'Dark', 'System'].includes(theme) ? theme : 'System';
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.classList.toggle(
    'dark',
    selectedTheme === 'Dark' || (selectedTheme === 'System' && systemPrefersDark),
  );
  sessionStorage.setItem('userTheme', selectedTheme);
}
