// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loadPinnedConversations,
  MAX_PINNED_CONVERSATIONS,
  togglePinnedConversation,
} from '../../src/lib/pinned-conversations.js';

const profileId = 'profile-one';
const key = `masterwhats:pinned-conversations:${profileId}`;

describe('pinned conversations', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('persists pinned conversations separately by profile', () => {
    const pinned = loadPinnedConversations(profileId);
    expect(togglePinnedConversation(pinned, 'chat-a', profileId)).toBe('pinned');
    expect(loadPinnedConversations(profileId).has('chat-a')).toBe(true);
    expect(loadPinnedConversations('profile-two').size).toBe(0);
  });

  it('allows unpinning and then pinning another conversation', () => {
    const pinned = new Set(['chat-a', 'chat-b', 'chat-c']);
    expect(togglePinnedConversation(pinned, 'chat-b', profileId)).toBe('unpinned');
    expect(togglePinnedConversation(pinned, 'chat-d', profileId)).toBe('pinned');
    expect([...pinned]).toEqual(['chat-a', 'chat-c', 'chat-d']);
  });

  it('does not pin a fourth conversation', () => {
    const pinned = new Set(['chat-a', 'chat-b', 'chat-c']);

    expect(MAX_PINNED_CONVERSATIONS).toBe(3);
    expect(togglePinnedConversation(pinned, 'chat-d', profileId)).toBe('limit');
    expect([...pinned]).toEqual(['chat-a', 'chat-b', 'chat-c']);
  });

  it('limits invalid stored values to three valid unique IDs', () => {
    localStorage.setItem(key, JSON.stringify(['chat-a', '', 4, 'chat-b', 'chat-a', 'chat-c', 'chat-d']));
    expect([...loadPinnedConversations(profileId)]).toEqual(['chat-a', 'chat-b', 'chat-c']);
  });

  it('survives malformed storage and blocked writes', () => {
    localStorage.setItem(key, '{broken');
    expect(loadPinnedConversations(profileId).size).toBe(0);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const pinned = new Set();
    expect(togglePinnedConversation(pinned, 'chat-a', profileId)).toBe('pinned');
    expect(pinned.has('chat-a')).toBe(true);
  });
});
