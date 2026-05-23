/** Apply stored theme & font-size preferences before Angular bootstraps */
export function applyStoredPreferences(): void {
  const theme = localStorage.getItem('lw_theme') || 'light';
  const fontSize = localStorage.getItem('lw_font_size') || 'md';
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-font-size', fontSize);
}

applyStoredPreferences();
