export function renderSoundtrackPlayer(container, { onChange } = {}) {
  const player = document.createElement('aside');
  player.className = 'soundtrack-player';
  player.hidden = true;
  player.setAttribute('aria-label', 'Player persistente da Trilha Sonora');

  const info = document.createElement('div');
  info.className = 'soundtrack-player-info';
  const cover = document.createElement('img');
  cover.className = 'soundtrack-player-cover';
  cover.alt = '';
  const text = document.createElement('div');
  text.className = 'soundtrack-player-text';
  const title = document.createElement('strong');
  const artist = document.createElement('span');
  text.append(title, artist);
  const source = document.createElement('a');
  source.className = 'soundtrack-player-source';
  source.target = '_blank';
  source.rel = 'noopener noreferrer';
  source.textContent = 'Deezer';
  info.append(cover, text, source);

  const close = document.createElement('button');
  close.className = 'soundtrack-player-close';
  close.type = 'button';
  close.textContent = 'Fechar e parar';
  close.setAttribute('aria-label', 'Fechar player e interromper o áudio');

  const status = document.createElement('p');
  status.className = 'soundtrack-player-status';
  status.setAttribute('aria-live', 'polite');
  status.textContent = 'Player oficial Deezer incorporado. Inicie ou pause pelo controle dentro do player.';

  const embed = document.createElement('div');
  embed.className = 'soundtrack-player-embed';
  let currentTrack = null;
  let loadTimeout = null;

  function stop() {
    clearTimeout(loadTimeout);
    loadTimeout = null;
    currentTrack = null;
    embed.replaceChildren();
    player.hidden = true;
    container.classList.remove('audio-player-open');
    onChange?.(null);
  }

  close.addEventListener('click', stop);

  player.append(info, close, status, embed);
  container.appendChild(player);

  return {
    select(track) {
      if (!track?.deezerTrackId || track.availability !== 'available') return;
      clearTimeout(loadTimeout);
      currentTrack = track;
      cover.src = track.coverUrl || '';
      title.textContent = track.title;
      artist.textContent = track.artist;
      source.href = track.deezerUrl;
      source.setAttribute('aria-label', `Abrir ${track.title} na Deezer`);
      status.textContent = 'Carregando o player oficial Deezer…';

      const iframe = document.createElement('iframe');
      iframe.title = `Player Deezer: ${track.title} — ${track.artist}`;
      iframe.src = `https://widget.deezer.com/widget/dark/track/${track.deezerTrackId}`;
      iframe.allow = 'autoplay; encrypted-media';
      iframe.loading = 'eager';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      iframe.addEventListener('load', () => {
        clearTimeout(loadTimeout);
        if (currentTrack?.id === track.id) {
          status.textContent = 'Player Deezer carregado. Use o controle do player para iniciar ou pausar a prévia.';
        }
      });
      iframe.addEventListener('error', () => {
        clearTimeout(loadTimeout);
        status.textContent = 'O player Deezer não carregou. Abra a faixa na Deezer pelo link ao lado.';
      });
      embed.replaceChildren(iframe);
      player.hidden = false;
      container.classList.add('audio-player-open');
      loadTimeout = setTimeout(() => {
        if (currentTrack?.id === track.id) {
          status.textContent = 'O player está demorando para carregar. Abra a faixa diretamente na Deezer pelo link ao lado.';
        }
      }, 15000);
      onChange?.(currentTrack.id);
    },
    stop,
    getCurrentTrack() {
      return currentTrack;
    },
  };
}
