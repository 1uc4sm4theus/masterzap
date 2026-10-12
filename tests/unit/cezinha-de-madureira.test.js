// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTACT_PROFILES } from '../../src/lib/profile-content.js';

const conversation = JSON.parse(readFileSync(
  join(import.meta.dirname, '../../data/conversations/cezinha-de-madureira.json'),
  'utf8',
));

describe('Cezinha de Madureira conversation', () => {
  it('preserves the provided labels and notes that they are unconfirmed', () => {
    expect(conversation.metadata.participants).toEqual(['DV', 'Cezinha de Madureira']);
    expect(conversation.metadata.note).toContain('ambos os rótulos devem ser confirmados');
    expect(conversation.messages.every(message => message.timestamp === null)).toBe(true);
  });

  it('keeps all nine records, including the two call records and inferred date', () => {
    expect(conversation.messages).toHaveLength(9);
    expect(conversation.messages.filter(message => message.type === 'call')).toHaveLength(2);
    expect(conversation.messages[4]).toMatchObject({
      date: '2025-03-13',
      time: null,
      content: 'Chamada de voz perdida',
    });
    expect(conversation.index.dates.reduce((count, day) => count + day.message_count, 0)).toBe(9);
    expect(conversation.index.dates[0].note).toContain('Data inferida');
  });

  it('documents the unconfirmed labels, transcript limits, and absent call audio', () => {
    const paragraphs = CONTACT_PROFILES['cezinha-de-madureira'].sections.flatMap(section => section.paragraphs);
    const profile = paragraphs.map(paragraph => paragraph.text).join(' ');
    expect(profile).toContain('não mostra o cabeçalho');
    expect(profile).toContain('é inferida');
    expect(profile).toContain('o áudio não foi fornecido');
  });
});
