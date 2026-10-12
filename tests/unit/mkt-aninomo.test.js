// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTACT_PROFILES } from '../../src/lib/profile-content.js';

const conversation = JSON.parse(readFileSync(
  join(import.meta.dirname, '../../data/conversations/mkt-aninomo.json'),
  'utf8',
));

describe('Mkt-aninomo conversation', () => {
  it('keeps the requested label separate from the anonymized sender name', () => {
    expect(conversation.metadata.participants).toEqual(['DV', 'Mkt-aninomo']);
    expect(conversation.messages.some(message => message.sender === 'Anônimo Marketing')).toBe(true);
    expect(conversation.metadata.note).toContain('not treated as a confirmed identity');
  });

  it('includes all 14 records without inventing the quoted message timestamp', () => {
    expect(conversation.messages).toHaveLength(14);
    expect(conversation.metadata.total_messages).toBe(14);
    expect(conversation.messages[1]).toMatchObject({
      id: 2,
      timestamp: null,
      date: 'sem-data',
      time: null,
    });
    expect(conversation.index.dates.reduce((count, day) => count + day.message_count, 0)).toBe(14);
  });

  it('has a contact profile describing the anonymization and transcript limits', () => {
    const paragraphs = CONTACT_PROFILES['mkt-aninomo'].sections.flatMap(section => section.paragraphs);
    expect(paragraphs.map(paragraph => paragraph.text).join(' ')).toContain('não permitem confirmar sua identidade');
    expect(paragraphs.map(paragraph => paragraph.text).join(' ')).toContain('não a conversa completa');
  });
});
