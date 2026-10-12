// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTACT_PROFILES } from '../../src/lib/profile-content.js';
import { formatDateLong, formatDateShort } from '../../src/lib/utils.js';
import { citationOf, longDate } from '../../scripts/lib/corpus.mjs';

const conversation = JSON.parse(readFileSync(
  join(import.meta.dirname, '../../data/conversations/amiga-anonima-01.json'),
  'utf8',
));

describe('amiga-anonima-01 conversation', () => {
  it('preserves the supplied attribution without inventing an exact date or source', () => {
    expect(conversation.metadata.participants).toEqual(['DV', 'amiga-anonima-01']);
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]).toMatchObject({
      id: 1,
      timestamp: null,
      date: '2024-07',
      time: null,
      timestamp_unknown: true,
      sender: 'DV',
      content: 'Ontem fui parar na festa da Anitta. Ela quase me estuprou. Saí correndo',
    });
    expect(conversation.metadata.source_detail.document_url).toBeNull();
    expect(conversation.index.dates).toEqual([{
      date: '2024-07',
      message_count: 1,
      first_message_id: 1,
      last_message_id: 1,
    }]);
  });

  it('displays the known month without implying a specific day', () => {
    expect(formatDateLong('2024-07').toLowerCase()).toBe('julho de 2024');
    expect(formatDateShort('2024-07')).toBe('07/2024');
    expect(longDate('2024-07').toLowerCase()).toBe('julho de 2024');
    expect(citationOf(conversation.messages[0])).toBe('07/2024');
  });

  it('explains that the recipient and publication are unverified', () => {
    const profile = CONTACT_PROFILES['amiga-anonima-01'].sections
      .flatMap(section => section.paragraphs)
      .map(paragraph => paragraph.text)
      .join(' ');
    expect(profile).toContain('não foram fornecidos para conferência');
    expect(profile).toContain('não constitui, por si só, comprovação independente');
  });
});
