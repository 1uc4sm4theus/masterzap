import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderSoundtrackPanel, SOUNDTRACK_TRACKS } from '../../src/components/SoundtrackPanel.js';
import { renderSoundtrackPlayer } from '../../src/components/SoundtrackPlayer.js';

describe('soundtrack catalog and module', () => {
  it('keeps 32 playlist tracks and adds two press-reported tracks without substituting a recording', () => {
    expect(SOUNDTRACK_TRACKS).toHaveLength(34);
    expect(SOUNDTRACK_TRACKS.filter(track => track.availability === 'available')).toHaveLength(32);
    const bigJetPlane = SOUNDTRACK_TRACKS.find(track => track.id === 'big-jet-plane');
    expect(bigJetPlane).toMatchObject({
      deezerTrackId: null,
      previewDurationSeconds: null,
      availability: 'unavailable',
    });
    expect(SOUNDTRACK_TRACKS.find(track => track.id === 'caminho-no-deserto-theo-rubia'))
      .toMatchObject({
        title: 'Caminho no Deserto',
        artist: 'Theo Rubia',
        availability: 'unavailable',
        classification: 'reported-listening',
        connectionTime: '08:52',
      });
    expect(SOUNDTRACK_TRACKS.find(track => track.id === 'eu-so-quero-tua-presenca-theo-rubia'))
      .toMatchObject({
        deezerTrackId: 1589515782,
        availability: 'available',
        classification: 'reported-listening',
      });
  });

  it('distinguishes third-party playlist entries from press-reported listening', () => {
    expect(SOUNDTRACK_TRACKS.filter(track => track.classification === 'third-party-playlist')).toHaveLength(32);
    expect(SOUNDTRACK_TRACKS.filter(track => track.classification === 'reported-listening')).toHaveLength(2);
  });

  it('does not load any audio embed until the visitor selects a track', () => {
    const onLoadTrack = vi.fn();
    const panel = renderSoundtrackPanel({ onLoadTrack });
    expect(panel.querySelectorAll('iframe')).toHaveLength(0);
    expect(panel.querySelectorAll('.soundtrack-track')).toHaveLength(34);
    expect(panel.textContent).toContain('A 33ª não foi inferida.');
    expect(panel.textContent).toContain('Execução relatada pela imprensa · conexão às 08:52');
    expect(panel.textContent).toContain('Gravação específica não validada para reprodução');
    expect(panel.textContent).toContain('academia particular de sua casa em São Paulo às 8h52');
    panel.querySelector('.soundtrack-play').click();
    expect(onLoadTrack).toHaveBeenCalledOnce();
    expect(panel.textContent).toContain('playlist abaixo foi publicada por terceiros');
    expect(panel.querySelector('.soundtrack-track[data-track-id="caminho-no-deserto-theo-rubia"] .soundtrack-source').href)
      .toContain('noticias.uol.com.br');
  });

  it('uses one persistent official widget and stops it when the player is closed', () => {
    const container = document.createElement('div');
    const onChange = vi.fn();
    const player = renderSoundtrackPlayer(container, { onChange });
    const tracks = SOUNDTRACK_TRACKS.filter(track => track.availability === 'available');

    expect(container.querySelector('iframe')).toBeNull();
    player.select(tracks[0]);
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    expect(container.querySelector('iframe').src).toBe(`https://widget.deezer.com/widget/dark/track/${tracks[0].deezerTrackId}`);
    expect(container.querySelector('iframe').src).not.toContain('autoplay');

    player.select(tracks[1]);
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
    expect(container.querySelector('iframe').src).toContain(String(tracks[1].deezerTrackId));

    container.querySelector('.soundtrack-player-close').click();
    expect(container.querySelector('iframe')).toBeNull();
    expect(container.querySelector('.soundtrack-player').hidden).toBe(true);
    expect(container.classList.contains('audio-player-open')).toBe(false);
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it('announces loading and an embed error with a direct Deezer fallback', () => {
    const container = document.createElement('div');
    const player = renderSoundtrackPlayer(container);
    player.select(SOUNDTRACK_TRACKS.find(track => track.availability === 'available'));
    const iframe = container.querySelector('iframe');
    expect(container.querySelector('.soundtrack-player-status').textContent).toContain('Carregando');
    iframe.dispatchEvent(new Event('error'));
    expect(container.querySelector('.soundtrack-player-status').textContent).toContain('Abra a faixa na Deezer');
    player.stop();
  });
});
