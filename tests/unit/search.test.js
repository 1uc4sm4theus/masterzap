import { describe, it, expect, beforeEach } from 'vitest';
import {
  countSearchIndex,
  search,
  searchIndex,
  normalize,
  resetSearchIndex,
} from '../../src/lib/search.js';

// We can't easily load the full search index in unit tests (it's fetched via HTTP),
// so we'll test the pure functions and mock the internal index.

describe('normalize()', () => {
  it('lowercases text', () => {
    expect(normalize('Hello World')).toBe('hello world');
  });

  it('strips accents', () => {
    expect(normalize('café')).toBe('cafe');
    expect(normalize('São Paulo')).toBe('sao paulo');
    expect(normalize('Zürich')).toBe('zurich');
  });

  it('handles Portuguese characters', () => {
    expect(normalize('ação')).toBe('acao');
    expect(normalize('coração')).toBe('coracao');
    expect(normalize('você')).toBe('voce');
  });

  it('handles empty string', () => {
    expect(normalize('')).toBe('');
  });

  it('preserves emojis', () => {
    expect(normalize('Bom dia☀️')).toBe('bom dia☀️');
  });
});

describe('search()', () => {
  beforeEach(() => {
    resetSearchIndex();
    // Manually inject test data into the module's internal index
    // We do this by importing the module internals
  });

  it('returns empty array when query is too short', () => {
    expect(search('a')).toEqual([]);
    expect(search('')).toEqual([]);
  });

  it('returns empty array when index is not loaded', () => {
    // Index hasn't been loaded yet
    expect(search('hello')).toEqual([]);
  });
});

describe('searchIndex()', () => {
  const index = [
    { id: 1, date: '2024-02-10', sender: 'DV', content: 'Diogo ligou' },
    { id: 2, date: '2025-02-10', sender: 'DV', content: 'Falei com Diogo' },
  ];

  it('searches a supplied index without relying on the active conversation', () => {
    const results = searchIndex(index, 'diogo');

    expect(results).toHaveLength(2);
    expect(results[0].content).toBe('Diogo ligou');
  });

  it('can return the newest matches first for global search', () => {
    const results = searchIndex(index, 'diogo', { newestFirst: true, limit: 1 });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(2);
  });

  it('keeps accent-insensitive matching and highlight offsets', () => {
    const results = searchIndex([
      { id: 1, date: '2025-02-10', sender: 'DV', content: 'Conversei com Diôgo' },
    ], 'diogo');

    expect(results[0].content.slice(results[0].matchStart, results[0].matchEnd)).toBe('Diôgo');
  });
});

describe('countSearchIndex()', () => {
  const index = [
    { id: 1, sender: 'DV', content: 'Irmão, tudo certo?' },
    { id: 2, sender: 'Martha', content: 'Falei com meu irmao' },
    { id: 3, sender: 'DV', content: 'Até amanhã' },
    { id: 4, sender: 'DV', content: 'Irmão, obrigado' },
  ];

  it('counts matching messages without being limited by the displayed result limit', () => {
    expect(countSearchIndex(index, 'irmao')).toBe(3);
  });

  it('supports filtering by sender', () => {
    expect(countSearchIndex(index, 'irmao', { sender: 'DV' })).toBe(2);
  });

  it('returns zero for queries that are too short', () => {
    expect(countSearchIndex(index, 'a')).toBe(0);
  });
});
