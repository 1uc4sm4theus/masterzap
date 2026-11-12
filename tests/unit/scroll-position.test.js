// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearChatScrollPositions,
  loadChatScrollPosition,
  saveChatScrollPosition,
} from '../../src/lib/scroll-position.js';

describe('chat scroll positions', () => {
  beforeEach(() => {
    clearChatScrollPositions();
  });

  it('persists only an anchored position away from the top', () => {
    expect(saveChatScrollPosition('chat', null)).toBe(false);
    expect(saveChatScrollPosition('chat', {
      messageId: '4', date: '2024-01-02', offset: 10, scrollTop: 0,
    })).toBe(false);
    expect(loadChatScrollPosition('chat')).toBeNull();

    expect(saveChatScrollPosition('chat', {
      messageId: '4', date: '2024-01-02', offset: 10, scrollTop: 200,
    })).toBe(true);
    expect(loadChatScrollPosition('chat')).toMatchObject({
      messageId: '4', date: '2024-01-02', offset: 10,
    });
  });

  it('ignores malformed persisted values', () => {
    localStorage.setItem('masterwhats:chat-scroll-positions', '{broken');
    expect(loadChatScrollPosition('chat')).toBeNull();
  });
});
