// @vitest-environment node
//
// Guards on the built data itself. These are the cheapest tests in the project:
// they read public/data and would have caught the id collision that silently
// overwrote Martha's chunks when the police report's excerpts of the same chat
// were emitted as a second conversation.

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '../..');
const DATA_DIR = join(ROOT, 'public/data');

const conversations = JSON.parse(
  readFileSync(join(DATA_DIR, 'conversations.json'), 'utf-8')
).conversations;

describe('conversations.json', () => {
  it('lists every conversation exactly once', () => {
    const ids = conversations.map(c => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('is ordered by most recent message, newest first', () => {
    const stamps = conversations.map(c => c.last_message?.timestamp || '');
    expect(stamps).toEqual([...stamps].sort().reverse());
  });

  it('gives every conversation a name that is not DV', () => {
    for (const conv of conversations) {
      const other = conv.participants.filter(p => p !== 'DV');
      expect(other.length, `${conv.id} has no contact name`).toBeGreaterThan(0);
      expect(other[0].trim()).not.toBe('');
    }
  });

  it('names the contact as a field, not as "the participant that is not DV"', () => {
    for (const conv of conversations) {
      const owner = conv.owner || 'DV';
      expect(conv.contact, conv.id).toBe(conv.participants.find(p => p !== owner) || conv.participants[0]);
    }
  });

  it('has a positive message count everywhere', () => {
    for (const conv of conversations) {
      expect(conv.total_messages, conv.id).toBeGreaterThan(0);
    }
  });

  it('uses one shape for date_range everywhere', () => {
    // messages.json says {start,end}; the IPJ builder briefly emitted a pair,
    // leaving consumers to guess which source a conversation came from.
    for (const conv of conversations) {
      expect(Object.keys(conv.date_range).sort(), conv.id).toEqual(['end', 'start']);
    }
  });

  it('keeps the date range consistent with the last message', () => {
    for (const conv of conversations) {
      expect(
        conv.last_message.timestamp.startsWith(conv.date_range.end), conv.id
      ).toBe(true);
    }
  });

  it('reports media tallies that are never negative', () => {
    for (const conv of conversations) {
      const media = conv.media_counts || {};
      for (const key of ['images', 'videos', 'documents']) {
        expect(media[key] ?? 0, `${conv.id}.${key}`).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

describe('per-conversation chunks', () => {
  it('ships an index and a search index for each conversation', () => {
    for (const conv of conversations) {
      expect(existsSync(join(DATA_DIR, conv.id, 'index.json')), conv.id).toBe(true);
      expect(existsSync(join(DATA_DIR, conv.id, 'search-index.json')), conv.id).toBe(true);
    }
  });

  it('has an index whose counts add up to the conversation total', () => {
    for (const conv of conversations) {
      const index = JSON.parse(
        readFileSync(join(DATA_DIR, conv.id, 'index.json'), 'utf-8')
      );
      const counted = index.dates.reduce((sum, d) => sum + d.message_count, 0);
      expect(counted, conv.id).toBe(conv.total_messages);
    }
  });

  it('has a day chunk for every date in the index', () => {
    for (const conv of conversations) {
      const index = JSON.parse(
        readFileSync(join(DATA_DIR, conv.id, 'index.json'), 'utf-8')
      );
      // Spot-check the ends rather than every day of Martha's 534.
      for (const entry of [index.dates[0], index.dates.at(-1)]) {
        const chunk = join(DATA_DIR, conv.id, `${entry.date}.json`);
        expect(existsSync(chunk), `${conv.id}/${entry.date}`).toBe(true);
      }
    }
  });
});

describe('profile coverage', () => {
  it('every conversation has a profile written for it', async () => {
    const { CONTACT_PROFILES } = await import('../../src/lib/profile-content.js');
    const missing = conversations
      .map(c => c.id)
      .filter(id => !CONTACT_PROFILES[id]);

    expect(missing).toEqual([]);
  });

  it('every profile has at least one section with text', async () => {
    const { CONTACT_PROFILES } = await import('../../src/lib/profile-content.js');

    for (const [id, profile] of Object.entries(CONTACT_PROFILES)) {
      expect(profile.sections.length, id).toBeGreaterThan(0);
      for (const section of profile.sections) {
        expect(section.paragraphs.length, id).toBeGreaterThan(0);
        for (const p of section.paragraphs) {
          expect(p.text.trim().length, id).toBeGreaterThan(0);
        }
      }
    }
  });

  it('does not carry a profile for a conversation that no longer exists', async () => {
    const { CONTACT_PROFILES } = await import('../../src/lib/profile-content.js');
    const ids = new Set(conversations.map(c => c.id));
    const orphans = Object.keys(CONTACT_PROFILES).filter(id => !ids.has(id));

    expect(orphans).toEqual([]);
  });
});

describe('the police report as a document', () => {
  it('is described once, with hash and page count, on every conversation from it', () => {
    const fromReport = conversations.filter(c => c.source?.startsWith('IPJ-A'));
    expect(fromReport.length).toBeGreaterThan(0);
    for (const conv of fromReport) {
      expect(conv.source_document?.sha256, conv.id).toMatch(/^[0-9a-f]{64}$/);
      expect(conv.source_document?.pages, conv.id).toBeGreaterThan(0);
      expect(conv.source_document?.file, conv.id).toMatch(/\.pdf$/);
      expect(conv.source_document?.url, conv.id).toMatch(/^https:\/\/github\.com\/.*\.pdf$/);
      expect(conv.source_document?.download, conv.id).toMatch(/^https:\/\/raw\.githubusercontent\.com\/.*\.pdf$/);
    }
  });

  it('is absent from the leak that did not come from it', () => {
    expect(conversations.find(c => c.id === 'martha-graeff').source_document).toBeUndefined();
  });
});
