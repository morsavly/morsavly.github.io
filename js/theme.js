(function () {
  const root = document.documentElement;
  const btn = document.querySelector('[data-theme-toggle]');
  const mq = matchMedia('(prefers-color-scheme:dark)');
  let current = mq.matches ? 'dark' : 'light';

  root.setAttribute('data-theme', current);

  const SUN_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const MOON_ICON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) btn.innerHTML = theme === 'dark' ? SUN_ICON : MOON_ICON;
    window.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
  }

  if (btn) {
    btn.addEventListener('click', () => {
      current = current === 'dark' ? 'light' : 'dark';
      applyTheme(current);
    });
  }
})();
