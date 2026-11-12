// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachSearch } from '../../src/components/SearchPanel.js';
import { resetSearchIndex } from '../../src/lib/search.js';

describe('global search results', () => {
  afterEach(() => {
    document.body.replaceChildren();
    localStorage.clear();
    resetSearchIndex();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows the source conversation, sent checks, favorite state, and quick navigation', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{
        id: 7,
        date: '2025-03-01',
        sender: 'DV',
        content: 'Café especial',
      }]),
    })));
    localStorage.setItem('masterwhats:favorite-messages', JSON.stringify([{
      conversationId: 'conversa-a',
      messageId: '7',
      conversationName: 'José',
      date: '2025-03-01',
      content: 'Café especial',
    }]));

    const sidebar = document.createElement('aside');
    sidebar.innerHTML = `
      <input class="sidebar-search-input">
      <div class="conversation-list"></div>`;
    document.body.appendChild(sidebar);
    const onResultClick = vi.fn();
    attachSearch(sidebar, [{
      id: 'conversa-a',
      contact: 'José',
      owner: 'DV',
      participants: ['José', 'DV'],
    }], {
      onResultClick,
      onConversationClick: vi.fn(),
    });

    const input = sidebar.querySelector('.sidebar-search-input');
    input.value = 'cafe';
    input.dispatchEvent(new Event('input'));
    await new Promise(resolve => setTimeout(resolve, 300));
    await new Promise(resolve => setTimeout(resolve, 0));

    const result = sidebar.querySelector('.search-result-item');
    expect(result.querySelector('.search-result-conversation').textContent).toBe('José');
    expect(result.querySelector('.search-result-status').textContent).toBe('✓✓');
    expect(result.querySelector('.search-result-favorite').textContent).toBe('★');
    result.click();
    expect(onResultClick).toHaveBeenCalledWith('conversa-a', 7, '2025-03-01');
  });
});
