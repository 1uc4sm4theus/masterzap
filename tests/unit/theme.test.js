// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderNavRail } from '../../src/components/NavRail.js';
import { initializeTheme, setDarkTheme } from '../../src/lib/theme.js';

describe('theme preference', () => {
  afterEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.body.replaceChildren();
  });

  it('defaults to light and restores a saved dark theme', () => {
    expect(initializeTheme()).toBe(false);
    expect(document.documentElement.dataset.theme).toBe('light');

    localStorage.setItem('masterwhats:theme', 'dark');
    expect(initializeTheme()).toBe(true);
    expect(document.documentElement.dataset.theme).toBe('dark');
  });

  it('persists the selected theme and updates the document state', () => {
    setDarkTheme(true);
    expect(localStorage.getItem('masterwhats:theme')).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    setDarkTheme(false);
    expect(localStorage.getItem('masterwhats:theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('places an accessible theme toggle below settings and updates its state', () => {
    const container = document.createElement('div');
    const onToggleTheme = vi.fn();
    const rail = renderNavRail(container, { onToggleTheme });
    const bottomButtons = rail.querySelectorAll('.nav-rail-bottom .nav-rail-btn');
    const settings = bottomButtons[0];
    const theme = bottomButtons[1];

    expect(theme.previousElementSibling).toBe(settings);
    expect(theme.getAttribute('aria-label')).toBe('Ativar tema escuro');
    expect(theme.getAttribute('aria-pressed')).toBe('false');

    theme.click();
    expect(onToggleTheme).toHaveBeenCalledOnce();

    rail.setDarkTheme(true);
    expect(theme.getAttribute('aria-label')).toBe('Ativar tema claro');
    expect(theme.getAttribute('aria-pressed')).toBe('true');
  });
});
