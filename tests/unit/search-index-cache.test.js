// @vitest-environment node
//
// Two behaviours that only started mattering once there was more than one
// conversation, and that both bit in practice.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { loadSearchIndex, isIndexLoaded, resetSearchIndex, search, searchIndex } from '../../src/lib/search.js';

const INDEXES = {
  'martha-graeff': [
    { id: 1, date: '2024-02-10', sender: 'DV', content: 'peleleca' },
  ],
  'alexandre-de-moraes': [
    { id: 1, date: '2025-11-15', sender: 'DV', content: 'Acha que segunda ja tenho que estar fora?' },
  ],
};

function mockFetch() {
  return vi.fn((url) => {
    const id = String(url).split('/').at(-2);
    const body = INDEXES[id];
    return Promise.resolve(
      body
        ? { ok: true, json: () => Promise.resolve(body) }
        : { ok: false, status: 404 }
    );
  });
}

describe('search index cache', () => {
  beforeEach(() => {
    resetSearchIndex();
    globalThis.fetch = mockFetch();
  });
  afterEach(() => vi.restoreAllMocks());

  it('loads the index for a conversation', async () => {
    await loadSearchIndex('martha-graeff');
    expect(search('peleleca')).toHaveLength(1);
  });

  it('serves the same conversation from cache', async () => {
    await loadSearchIndex('martha-graeff');
    await loadSearchIndex('martha-graeff');

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  // The cache used to be a single module-level variable that ignored the id, so
  // the second conversation opened kept answering with the first one's messages.
  it('refetches when the conversation changes', async () => {
    await loadSearchIndex('martha-graeff');
    await loadSearchIndex('alexandre-de-moraes');

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
    expect(search('peleleca')).toHaveLength(0);
    expect(search('estar fora')).toHaveLength(1);
  });

  it('reports loaded state per conversation', async () => {
    expect(isIndexLoaded('martha-graeff')).toBe(false);

    await loadSearchIndex('martha-graeff');

    expect(isIndexLoaded('martha-graeff')).toBe(true);
    expect(isIndexLoaded('alexandre-de-moraes')).toBe(false);
    expect(isIndexLoaded()).toBe(true);
  });

  it('loads multiple conversation indexes concurrently without mixing their results', async () => {
    const [marthaIndex, alexandreIndex] = await Promise.all([
      loadSearchIndex('martha-graeff'),
      loadSearchIndex('alexandre-de-moraes'),
    ]);

    expect(searchIndex(marthaIndex, 'peleleca')).toHaveLength(1);
    expect(searchIndex(alexandreIndex, 'peleleca')).toHaveLength(0);
    expect(searchIndex(alexandreIndex, 'estar fora')).toHaveLength(1);
  });

  it('propagates a failed fetch and stays unloaded', async () => {
    await expect(loadSearchIndex('nao-existe')).rejects.toThrow();
    expect(isIndexLoaded('nao-existe')).toBe(false);
  });
});

describe('search result excerpts', () => {
  beforeEach(() => {
    resetSearchIndex();
    globalThis.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([{
        id: 1,
        date: '2025-11-15',
        sender: 'DV',
        // A note long enough that a late match would sit off the right edge of
        // the single-line, ellipsized result row.
        content: 'Que loucura, bem na semana que estou resolvendo tudo. Aquele mesmo juiz Ricardo? '
          + 'E o Galipolo ta sabendo? Conseguimos fazer algo? Acha que segunda ja tenho que estar fora?',
      }]),
    }));
  });
  afterEach(() => vi.restoreAllMocks());

  it('recentres long content on the match', async () => {
    await loadSearchIndex('alexandre-de-moraes');
    const [hit] = search('estar fora');

    expect(hit.content.length).toBeLessThan(150);
    expect(hit.content).toContain('estar fora');
    expect(hit.content.startsWith('…')).toBe(true);
    // The offsets must still point at the match inside the trimmed string.
    expect(hit.content.slice(hit.matchStart, hit.matchEnd)).toBe('estar fora');
  });

  it('leaves short content untouched', async () => {
    await loadSearchIndex('alexandre-de-moraes');
    const [hit] = search('Que loucura');

    expect(hit.content.startsWith('Que loucura')).toBe(true);
    expect(hit.matchStart).toBe(0);
    expect(hit.content.slice(hit.matchStart, hit.matchEnd)).toBe('Que loucura');
  });

  it('finds a match near the end and keeps the offsets valid', async () => {
    await loadSearchIndex('alexandre-de-moraes');
    const [hit] = search('fora?');

    expect(hit.content.slice(hit.matchStart, hit.matchEnd)).toBe('fora?');
  });
});
