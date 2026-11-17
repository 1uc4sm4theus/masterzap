import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LIVESTREAMS } from '../../src/data/livestreams.js';
import { renderLivestreamHomeCall, renderLivestreamPanel } from '../../src/components/LivestreamPanel.js';

describe('livestream experience', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('registers the test hearing without an unconfirmed video URL or ID', () => {
    const event = LIVESTREAMS[0];
    expect(event).toMatchObject({
      title: 'Audiência pública — Caso Banco Master',
      institution: 'Senado Federal',
      date: '2026-11-18',
      time: '14:00',
      status: 'scheduled',
      officialUrl: null,
      youtubeVideoId: null,
    });
    expect(event.participants.map(person => person.name)).toEqual([
      'Andrei Rodrigues',
      'Wellington César Lima e Silva',
    ]);
  });

  it('shows the home call and opens the event without rendering a fake player', () => {
    const onOpen = vi.fn();
    const call = renderLivestreamHomeCall({ onOpen });
    document.body.appendChild(call);

    expect(call.textContent).toContain('MASTERWHATS AO VIVO');
    expect(call.textContent).toContain('18/11/2026 · 14h · Senado Federal');
    expect(call.textContent).toContain('AGENDADA · TESTE');
    call.querySelector('button').click();
    expect(onOpen).toHaveBeenCalledWith(LIVESTREAMS[0].id);

    const panel = renderLivestreamPanel();
    expect(panel.textContent).toContain('A TRANSMISSÃO AINDA NÃO ESTÁ DISPONÍVEL');
    expect(panel.textContent).toContain('O Senado Federal ainda não disponibilizou o link da transmissão.');
    expect(panel.textContent).toContain('Esta página está preparada para receber o sinal oficial da audiência.');
    expect(panel.querySelector('iframe')).toBeNull();
  });

  it('loads a YouTube player and offers fullscreen and an external watch link when configured', () => {
    const event = { ...LIVESTREAMS[0], youtubeVideoId: 'abcdefghijk' };
    const panel = renderLivestreamPanel({ event });
    const frame = panel.querySelector('iframe');

    expect(frame.src).toBe('https://www.youtube-nocookie.com/embed/abcdefghijk');
    expect(frame.allowFullscreen).toBe(true);
    expect(panel.querySelector('.livestream-youtube-link').href).toBe('https://www.youtube.com/watch?v=abcdefghijk');
    expect(panel.querySelector('.livestream-control-button')).not.toBeNull();
  });

  it('provides a back action', () => {
    const onBack = vi.fn();
    renderLivestreamPanel({ onBack }).querySelector('.livestream-back').click();
    expect(onBack).toHaveBeenCalledOnce();
  });
});
