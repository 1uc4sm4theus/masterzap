// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerOpenMenu } from '../../src/lib/open-menu.js';

describe('exclusive transient menus', () => {
  afterEach(() => {
    document.body.replaceChildren();
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
    vi.restoreAllMocks();
  });

  it('closes the previous menu and closes on an outside pointer', async () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    document.body.append(first, second);
    const firstClose = vi.fn(() => first.remove());
    const secondClose = vi.fn(() => second.remove());

    const releaseFirst = registerOpenMenu(first, firstClose);
    const releaseSecond = registerOpenMenu(second, secondClose);

    expect(firstClose).toHaveBeenCalledOnce();
    expect(first.isConnected).toBe(false);
    expect(second.isConnected).toBe(true);

    document.dispatchEvent(new Event('pointerdown'));
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(secondClose).toHaveBeenCalledOnce();
    expect(second.isConnected).toBe(false);
    releaseFirst();
    releaseSecond();
  });

  it('closes the active menu on browser back', () => {
    const menu = document.createElement('div');
    document.body.appendChild(menu);
    const onClose = vi.fn(() => menu.remove());
    const release = registerOpenMenu(menu, onClose);

    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));

    expect(onClose).toHaveBeenCalledOnce();
    expect(menu.isConnected).toBe(false);
    release();
  });
});
