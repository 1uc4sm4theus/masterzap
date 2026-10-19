const THEME_STORAGE_KEY = 'masterwhats:theme';

/** Apply a theme preference and persist it when browser storage is available. */
export function setDarkTheme(enabled) {
  const theme = enabled ? 'dark' : 'light';
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', enabled ? '#111b21' : '#1DAA61');

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Theme preference could not be saved:', error);
  }
}

/** Restore the saved theme before the application becomes visible. */
export function initializeTheme() {
  let theme = 'light';

  try {
    if (localStorage.getItem(THEME_STORAGE_KEY) === 'dark') theme = 'dark';
  } catch (error) {
    console.warn('Theme preference could not be loaded:', error);
  }

  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#111b21' : '#1DAA61');
  return theme === 'dark';
}
