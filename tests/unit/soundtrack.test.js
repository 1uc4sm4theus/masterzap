import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderSoundtrackPanel, SOUNDTRACK_TRACKS } from '../../src/components/SoundtrackPanel.js';
import { renderSoundtrackPlayer } from '../../src/components/SoundtrackPlayer.js';

describe('soundtrack catalog and module', () => {
  it('keeps all 32 listed tracks and records the missing preview without substituting a version', () => {
    expect(SOUNDTRACK_TRACKS).toHaveLength(32);
    expect(SOUNDTRACK_TRACKS.filter(track => track.availability === 'available')).toHaveLength(31);
    const bigJetPlane = SOUNDTRACK_TRACKS.find(track => track.id === 'big-jet-plane');
    expect(bigJetPlane).toMatchObject({
      deezerTrackId: null,
      previewDurationSeconds: null,
      availability: 'unavailable',
    });
  });

  it('classifies the playlist association as third-party for every track', () => {
    expect(SOUNDTRACK_TRACKS.every(track => track.classification === 'third-party-playlist')).toBe(true);
  });

  it('does not load any audio embed until the visitor selects a track', () => {
    const onLoadTrack = vi.fn();
    const panel = renderSoundtrackPanel({ onLoadTrack });
    expect(panel.querySelectorAll('iframe')).toHaveLength(0);
    expect(panel.querySelectorAll('.soundtrack-track')).toHaveLength(32);
    expect(panel.textContent).toContain('A 33ª não foi inferida.');
    panel.querySelector('.soundtrack-play').click();
    expect(onLoadTrack).toHaveBeenCalledOnce();
    expect(panel.textContent).toContain('playlist publicada por terceiros');
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
    player.select(SOUNDTRACK_TRACKS[0]);
    const iframe = container.querySelector('iframe');
    expect(container.querySelector('.soundtrack-player-status').textContent).toContain('Carregando');
    iframe.dispatchEvent(new Event('error'));
    expect(container.querySelector('.soundtrack-player-status').textContent).toContain('Abra a faixa na Deezer');
    player.stop();
  });
});
