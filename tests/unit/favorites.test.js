import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isFavoriteMessageSaved,
  loadFavoriteMessages,
  removeFavoriteMessage,
  toggleFavoriteMessage,
} from '../../src/lib/favorites.js';
import { renderFavoritesPanel } from '../../src/components/FavoritesPanel.js';

const STORAGE_KEY = 'masterwhats:favorite-messages';
const MESSAGE = {
  conversationId: 'martha-graeff',
  messageId: '42',
  conversationName: 'Martha Graeff',
  date: '2025-01-15',
  time: '12:30',
  sender: 'DV',
  content: 'Mensagem importante',
};

describe('favorite messages', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  it('saves favorites across loads in the same browser', () => {
    const favorites = [];

    expect(toggleFavoriteMessage(favorites, MESSAGE)).toBe(true);
    expect(loadFavoriteMessages()).toHaveLength(1);
    expect(loadFavoriteMessages()[0]).toMatchObject(MESSAGE);
    expect(isFavoriteMessageSaved(favorites, MESSAGE.conversationId, MESSAGE.messageId)).toBe(true);
  });

  it('toggles an existing message off without creating duplicates', () => {
    const favorites = [];
    toggleFavoriteMessage(favorites, MESSAGE);
    toggleFavoriteMessage(favorites, MESSAGE);

    expect(favorites).toHaveLength(0);
    expect(loadFavoriteMessages()).toHaveLength(0);
  });

  it('removes one favorite by conversation and message ID', () => {
    const favorites = [];
    toggleFavoriteMessage(favorites, MESSAGE);

    expect(removeFavoriteMessage(favorites, 'martha-graeff', '42')).toBe(true);
    expect(removeFavoriteMessage(favorites, 'martha-graeff', '42')).toBe(false);
    expect(loadFavoriteMessages()).toHaveLength(0);
  });

  it('ignores malformed saved data', () => {
    localStorage.setItem(STORAGE_KEY, '[null, {"conversationId":"bad"}]');
    expect(loadFavoriteMessages()).toEqual([]);
  });

  it('keeps favorites usable when localStorage cannot be read or written', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const favorites = [];

    expect(loadFavoriteMessages()).toEqual([]);
    expect(toggleFavoriteMessage(favorites, MESSAGE)).toBe(true);
    expect(favorites).toHaveLength(1);
  });
});

describe('favorite messages panel', () => {
  beforeEach(() => localStorage.clear());

  it('opens the selected message and removes a favorite', () => {
    const favorites = [];
    toggleFavoriteMessage(favorites, MESSAGE);
    const onOpenMessage = vi.fn();
    const panel = renderFavoritesPanel(favorites, { onOpenMessage });

    expect(panel.textContent).toContain('Mensagens favoritas');
    expect(panel.textContent).toContain('Mensagem importante');
    panel.querySelector('.favorite-item-open').click();
    expect(onOpenMessage).toHaveBeenCalledWith('martha-graeff', '42');

    panel.querySelector('.favorite-item-remove').click();
    expect(panel.querySelector('.favorites-empty')).not.toBeNull();
    expect(loadFavoriteMessages()).toHaveLength(0);
  });
});
