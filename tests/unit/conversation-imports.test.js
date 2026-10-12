// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTACT_PROFILES } from '../../src/lib/profile-content.js';

const readConversation = id => JSON.parse(readFileSync(
  join(import.meta.dirname, `../../data/conversations/${id}.json`),
  'utf8',
));

describe('imported conversation updates', () => {
  it('extends Ciro Soares with the 64 additional sourced records', () => {
    const conversation = readConversation('ciro-soares');
    expect(conversation.messages).toHaveLength(115);
    expect(conversation.metadata.total_messages).toBe(115);
    expect(conversation.messages.filter(message => message.id > 51)).toHaveLength(64);
    expect(conversation.metadata.date_range).toEqual({ start: '2024-01-31', end: '2025-11-12' });
    expect(conversation.messages.find(message => message.id === 52).source_cite).toContain('O Globo');
    expect(conversation.messages.find(message => message.id === 58)).toMatchObject({
      timestamp: null,
      date: '2024-01-31',
      time: null,
      timestamp_unknown: true,
    });
    expect(conversation.index.dates.reduce((count, day) => count + day.message_count, 0)).toBe(115);
  });

  it('keeps Ana Matos messages intact and updates their documentary citations', () => {
    const conversation = readConversation('ana-matos-mkt');
    expect(conversation.messages).toHaveLength(99);
    expect(conversation.metadata.source_detail.document_pages).toBe(218);
    const profile = CONTACT_PROFILES['ana-matos-mkt'].sections[0].paragraphs.map(paragraph => paragraph.text).join(' ');
    expect(profile).toContain('laudo p. 189, fig. 196');
    expect(profile).toContain('laudo p. 194, fig. 203');
  });

  it.each([
    ['berg', 'José Alfredo Berg Filho', 14],
    ['marcelo-terra-firme', 'Marcelo Terra Firme', 6],
    ['mario-frias', 'Mário Frias', 4],
    ['mauricio-quadrado', 'Maurício Quadrado', 12],
    ['ricardo-gordo-siqueira-rodrigues', 'Ricardo Siqueira Rodrigues', 30],
  ])('registers %s with its source and profile', (id, contact, count) => {
    const conversation = readConversation(id);
    expect(conversation.metadata.participants).toEqual(['DV', contact]);
    expect(conversation.messages).toHaveLength(count);
    expect(conversation.metadata.source_detail.label).toBe(conversation.metadata.source);
    expect(CONTACT_PROFILES[id].sections.length).toBeGreaterThan(0);
    expect(conversation.index.dates.reduce((total, day) => total + day.message_count, 0)).toBe(count);
  });
});
