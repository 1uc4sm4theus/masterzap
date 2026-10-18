import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '../..');
const conversation = JSON.parse(
  readFileSync(join(ROOT, 'data/conversations/walfrido-warde-new.json'), 'utf-8')
);
const publicIndex = JSON.parse(
  readFileSync(join(ROOT, 'public/data/walfrido-warde-new/index.json'), 'utf-8')
);

describe('Walfrido Warde conversation additions', () => {
  it('keeps the audio dated while leaving its time unspecified', () => {
    const chunk = JSON.parse(
      readFileSync(join(ROOT, 'public/data/walfrido-warde-new/2025-03-30.json'), 'utf-8')
    );
    expect(chunk.messages).toHaveLength(1);
    expect(chunk.messages[0].date).toBe('2025-03-30');
    expect(chunk.messages[0].timestamp).toBeNull();
    expect(chunk.messages[0].timestamp_unknown).toBe(true);
    expect(chunk.messages[0].content)
      .toBe('A GLOBO BASICAMENTE TÁ QUERENDO QUEBRAR O TEU APOIO INTERNO DENTRO DO PT ENTENDEU. JÁ ENTENDERAM QUE SEU APOIO VEIO DO PRESIDENTE. ELES QUEREM TIRAR TEU APOIO');
    expect(chunk.messages[0].type).toBe('audio');
    expect(chunk.messages[0].audio_src).toBe('/media/walfrido-warde-2025-03-30.mp3');
    expect(existsSync(join(ROOT, 'public/media/walfrido-warde-2025-03-30.mp3'))).toBe(true);
    const undated = JSON.parse(
      readFileSync(join(ROOT, 'public/data/walfrido-warde-new/sem-data.json'), 'utf-8')
    );
    expect(undated.messages).toHaveLength(8);
    expect(undated.messages.some(message => message.content.startsWith('Resumo do áudio:'))).toBe(false);
    expect(undated.messages.find(message => message.sender === 'Falante não identificado')?.content)
      .toContain('Galípolo ficou de ir lá pra casa de Davi');
  });

  it('uses the supplied portrait for Walfrido Warde New', () => {
    const main = readFileSync(join(ROOT, 'src/main.js'), 'utf-8');
    expect(main).toContain("'walfrido-warde-new': '/assets/avatar-walfrido-warde-new.jpg'");
    expect(existsSync(join(ROOT, 'public/assets/avatar-walfrido-warde-new.jpg'))).toBe(true);
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
    expect(publicIndex.dates[0].date).toBe('2025-03-30');
    expect(publicIndex.dates.at(-1).date).toBe('sem-data');
    expect(conversation.metadata.total_messages).toBe(54);
    expect(conversation.metadata.date_range.start).toBe('2025-03-30');
    expect(conversation.metadata.date_range.end).toBe('2025-07-23');
  });
});
