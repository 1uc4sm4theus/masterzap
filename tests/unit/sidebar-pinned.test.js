// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderSidebar } from '../../src/components/Sidebar.js';

describe('pinned conversation sidebar ordering', () => {
  afterEach(() => document.body.replaceChildren());

  it('moves only the changed row when pinning and unpinning', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const conversations = [
      { id: 'chat-a', contact: 'A', avatar: '/a.jpg' },
      { id: 'chat-b', contact: 'B', avatar: '/b.jpg' },
      { id: 'chat-c', contact: 'C', avatar: '/c.jpg' },
      { id: 'chat-d', contact: 'D', avatar: '/d.jpg' },
    ];
    const sidebar = renderSidebar(container, {
      conversations,
      onSelect: () => {},
      pinnedConversations: new Set(),
    });
    const order = () => [...sidebar.querySelectorAll('.conversation-item')].map(item => item.dataset.id);
    const originalItems = new Map([...sidebar.querySelectorAll('.conversation-item')]
      .map(item => [item.dataset.id, item]));
    const list = sidebar.querySelector('.conversation-list');
    const insertBefore = vi.spyOn(list, 'insertBefore');

    expect(order()).toEqual(['chat-a', 'chat-b', 'chat-c', 'chat-d']);

    const firstPinned = new Set(['chat-c']);
    sidebar.refreshPinnedConversations(firstPinned, 'chat-c');

    expect(order()).toEqual(['chat-c', 'chat-a', 'chat-b', 'chat-d']);
    expect(sidebar.querySelector('[data-id="chat-c"]').classList.contains('conversation-item-pinned')).toBe(true);
    expect(insertBefore).toHaveBeenCalledTimes(1);
    for (const [id, originalItem] of originalItems) {
      expect(sidebar.querySelector(`[data-id="${id}"]`)).toBe(originalItem);
    }
    expect(sidebar.querySelector('[data-id="chat-a"] img').getAttribute('src')).toBe('/a.jpg');

    insertBefore.mockClear();
    const noPinned = new Set();
    sidebar.refreshPinnedConversations(noPinned, 'chat-c');

    expect(order()).toEqual(['chat-a', 'chat-b', 'chat-c', 'chat-d']);
    expect(insertBefore).toHaveBeenCalledTimes(1);
    expect(sidebar.querySelector('[data-id="chat-c"]').classList.contains('conversation-item-pinned')).toBe(false);
  });
});
