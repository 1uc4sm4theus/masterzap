// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { printChat } from '../../src/lib/print.js';

describe('printChat()', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens native printing and restores the document title afterward', () => {
    const originalTitle = document.title;
    window.print = vi.fn();

    printChat('Martha Graeff');

    expect(window.print).toHaveBeenCalledOnce();
    expect(document.title).toBe('MasterWhats - Martha Graeff');
    window.dispatchEvent(new Event('afterprint'));
    expect(document.title).toBe(originalTitle);
  });

  it('reports browsers that do not provide printing', () => {
    window.print = undefined;

    expect(() => printChat('Contato')).toThrow('A impressão não está disponível');
  });
});
