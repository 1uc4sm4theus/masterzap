import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');
const conversation = JSON.parse(
  readFileSync(join(ROOT, 'data/conversations/walfrido-warde-new.json'), 'utf-8')
);
const publicIndex = JSON.parse(
  readFileSync(join(ROOT, 'public/data/walfrido-warde-new/index.json'), 'utf-8')
);

describe('Walfrido Warde conversation additions', () => {
  it('keeps the audio transcriptions explicitly undated', () => {
    const chunk = JSON.parse(
      readFileSync(join(ROOT, 'public/data/walfrido-warde-new/sem-data.json'), 'utf-8')
    );
    expect(chunk.messages).toHaveLength(11);
    expect(chunk.messages.every(message => message.timestamp === null && message.timestamp_unknown)).toBe(true);
    expect(chunk.messages[0].content).toContain('Guido está em Londres');
    expect(chunk.messages.find(message => message.sender === 'Falante não identificado')?.content)
      .toContain('Galípolo ficou de ir lá pra casa de Davi');
  });

  it('includes the dated screenshot messages in the day chunks and index', () => {
    const july17 = JSON.parse(
      readFileSync(join(ROOT, 'public/data/walfrido-warde-new/2025-07-17.json'), 'utf-8')
    );
    const july23 = JSON.parse(
      readFileSync(join(ROOT, 'public/data/walfrido-warde-new/2025-07-23.json'), 'utf-8')
    );
    expect(july17.messages).toHaveLength(10);
    expect(july17.messages[0].time).toBe('22:13:37');
    expect(july23.messages).toHaveLength(4);
    expect(publicIndex.dates.at(-1).date).toBe('sem-data');
    expect(conversation.metadata.total_messages).toBe(56);
    expect(conversation.metadata.date_range.end).toBe('2025-07-23');
  });
});
