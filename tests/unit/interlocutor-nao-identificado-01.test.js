// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CONTACT_PROFILES } from '../../src/lib/profile-content.js';
import { citationOf } from '../../scripts/lib/corpus.mjs';

const conversation = JSON.parse(readFileSync(
  join(import.meta.dirname, '../../data/conversations/interlocutor-nao-identificado-01.json'),
  'utf8',
));

describe('interlocutor-nao-identificado-01 conversation', () => {
  it('keeps the recipient and date unidentified and preserves the published excerpt', () => {
    expect(conversation.metadata.participants).toEqual(['DV', 'interlocutor-nao-identificado-01']);
    expect(conversation.metadata.date_range).toEqual({ start: 'sem-data', end: 'sem-data' });
    expect(conversation.messages).toHaveLength(1);
    expect(conversation.messages[0]).toMatchObject({
      id: 1,
      timestamp: null,
      date: 'sem-data',
      time: null,
      timestamp_unknown: true,
      sender: 'DV',
      content: 'Cara, essa Anitta tem alguma coisa diferente. Ela ficou dançando comigo. Foi por um triz. Se eu não tivesse apaixonado…',
    });
    expect(conversation.messages[0].source_cite).toContain('data não divulgada');
    expect(citationOf(conversation.messages[0])).toBe('Data não informada');
    expect(conversation.metadata.source_detail.document_url).toBeNull();
  });

  it('documents that the quote is truncated and its context is attributed to the report', () => {
    const profile = CONTACT_PROFILES['interlocutor-nao-identificado-01'].sections
      .flatMap(section => section.paragraphs)
      .map(paragraph => paragraph.text)
      .join(' ');
    expect(profile).toContain('não identifica o destinatário');
    expect(profile).toContain('termina em reticências');
    expect(profile).toContain('também é apresentado como relato da publicação');
    expect(profile).toContain('O link exato da reportagem não foi fornecido');
  });
});
