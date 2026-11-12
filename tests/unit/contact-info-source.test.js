// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import { showContactInfo } from '../../src/components/ContactInfo.js';

describe('contact source section', () => {
  it('shows conversation provenance in the source section', () => {
    vi.stubGlobal('requestAnimationFrame', callback => callback());
    const mainArea = document.createElement('main');
    const drawer = showContactInfo(mainArea, {
      id: 'source-chat',
      contact: 'Contato',
      participants: ['Contato', 'DV'],
      total_messages: 1,
      source: 'Transcrição da perícia',
      source_detail: { how: 'Extraída do aparelho apreendido.' },
    });

    expect(drawer.element.querySelector('#contact-info-source').textContent)
      .toContain('Transcrição da perícia');
    expect(drawer.element.querySelector('#contact-info-source').textContent)
      .toContain('Extraída do aparelho apreendido.');
    drawer.destroy();
    vi.unstubAllGlobals();
  });
});
