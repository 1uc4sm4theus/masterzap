import catalog from '../data/soundtrack.json';

const tracks = catalog.tracks;
const PLAYLIST_URL = catalog.playlist.sourceUrl;
const availableTracks = tracks.filter(track => track.availability === 'available');

function formatPreviewDuration(seconds) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function renderSoundtrackPanel({ onBack, onLoadTrack, currentTrackId = null } = {}) {
  const panel = document.createElement('section');
  panel.className = 'soundtrack-panel';
  panel.setAttribute('aria-labelledby', 'soundtrack-title');

  const header = document.createElement('header');
  header.className = 'soundtrack-header';
  const back = document.createElement('button');
  back.className = 'soundtrack-back';
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar às conversas');
  back.textContent = '‹';
  back.addEventListener('click', () => onBack?.());
  header.appendChild(back);

  const heading = document.createElement('div');
  heading.innerHTML = '<h1 id="soundtrack-title">Trilha Sonora</h1><p>Músicas associadas às conversas e aos registros documentais do caso.</p>';
  header.appendChild(heading);
  panel.appendChild(header);

  const content = document.createElement('div');
  content.className = 'soundtrack-content';

  const provenance = document.createElement('aside');
  provenance.className = 'soundtrack-provenance';
  provenance.setAttribute('aria-label', 'Nota de proveniência documental');
  provenance.innerHTML = `
    <p><strong>Proveniência:</strong> a playlist abaixo foi publicada por terceiros. As faixas marcadas como execução relatada são registros separados, citados em reportagem, e não fazem parte dessa playlist.</p>
    <p>Em 9 de novembro de 2026, o UOL noticiou que o celular de Vorcaro se conectou ao som da academia particular de sua casa em São Paulo às 8h52; por quase uma hora, tocaram músicas gospel, incluindo “Caminho no Deserto” e “Eu Só Quero Tua Presença”, de Theo Rubia. A reportagem não comprova que essas faixas integrem a playlist de terceiros.</p>
    <p>A API de metadados da Deezer não permite chamadas diretas pelo navegador (CORS); os créditos e as prévias foram conferidos na consulta pública, e a reprodução usa o widget oficial. Não foram armazenadas URLs MP3 temporárias. A busca oficial do YouTube exigiria uma chave não disponível; nenhum vídeo foi presumido.</p>
    <p><strong>Contagem:</strong> a reportagem menciona 33 faixas, mas a relação textual recebida contém 32. A 33ª não foi inferida.</p>
    <a href="${PLAYLIST_URL}" target="_blank" rel="noopener noreferrer">Abrir playlist de referência no Spotify</a>
    <a href="https://noticias.uol.com.br/colunas/cezar-feitoza/2026/11/09/vorcaro-cogitou-ser-preso-apos-encontro-com-moraes-o-que-e-tremembe.htm" target="_blank" rel="noopener noreferrer">Abrir reportagem do UOL sobre a música na academia</a>
  `;
  content.appendChild(provenance);

  const summary = document.createElement('p');
  summary.className = 'soundtrack-summary';
  summary.textContent = `${availableTracks.length} de ${tracks.length} faixas com prévia indicada pela Deezer. A prévia é reproduzida no player oficial incorporado.`;
  content.appendChild(summary);

  const list = document.createElement('ol');
  list.className = 'soundtrack-list';
  list.setAttribute('aria-label', 'Músicas citadas e faixas da playlist de referência');
  const buttonsById = new Map();

  for (const track of tracks) {
    const item = document.createElement('li');
    item.className = 'soundtrack-track';
    item.dataset.trackId = track.id;
    if (track.id === currentTrackId) item.classList.add('soundtrack-track--selected');

    const cover = document.createElement('img');
    cover.className = 'soundtrack-cover';
    cover.alt = track.coverUrl ? `Capa: ${track.title}` : '';
    cover.loading = 'lazy';
    cover.width = 56;
    cover.height = 56;
    if (track.coverUrl) cover.src = track.coverUrl;
    else {
      cover.classList.add('soundtrack-cover--empty');
      cover.src = '/assets/masterzap-logo.png';
    }
    item.appendChild(cover);

    const details = document.createElement('div');
    details.className = 'soundtrack-track-details';
    const title = document.createElement('h2');
    title.textContent = track.title;
    const artist = document.createElement('p');
    artist.className = 'soundtrack-artist';
    artist.textContent = track.artist;
    const classification = document.createElement('p');
    classification.className = 'soundtrack-classification';
    classification.textContent = track.classification === 'reported-listening'
      ? `Execução relatada pela imprensa · conexão às ${track.connectionTime}`
      : 'Playlist de terceiros · sem comprovação de audição';
    details.append(title, artist, classification);
    if (track.sourceNote) {
      const sourceNote = document.createElement('p');
      sourceNote.className = 'soundtrack-source-note';
      sourceNote.textContent = track.sourceNote;
      details.appendChild(sourceNote);
    }
    item.appendChild(details);

    const actions = document.createElement('div');
    actions.className = 'soundtrack-actions';
    const status = document.createElement('span');
    status.className = 'soundtrack-availability';
    status.textContent = track.availability === 'available'
      ? `Prévia · ${formatPreviewDuration(track.previewDurationSeconds)}`
      : track.classification === 'reported-listening'
        ? 'Gravação específica não validada para reprodução'
        : 'Prévia indisponível: gravação de estúdio não validada';
    actions.appendChild(status);

    if (track.availability === 'available') {
      const button = document.createElement('button');
      button.className = 'soundtrack-play';
      button.type = 'button';
      button.textContent = track.id === currentTrackId ? 'Player carregado' : 'Ouvir no player';
      button.setAttribute('aria-label', `Carregar prévia de ${track.title}, ${track.artist}`);
      button.setAttribute('aria-pressed', String(track.id === currentTrackId));
      button.addEventListener('click', () => onLoadTrack?.(track));
      buttonsById.set(track.id, button);
      actions.appendChild(button);
    } else {
      const unavailable = document.createElement('span');
      unavailable.className = 'soundtrack-unavailable';
      unavailable.textContent = 'Sem áudio validado';
      actions.appendChild(unavailable);
    }

    const source = document.createElement('a');
    source.className = 'soundtrack-source';
    source.href = track.sourceUrl || track.deezerUrl || PLAYLIST_URL;
    source.target = '_blank';
    source.rel = 'noopener noreferrer';
    source.textContent = track.sourceUrl ? 'Reportagem UOL' : track.deezerUrl ? 'Deezer' : 'Playlist de referência';
    source.setAttribute('aria-label', `Abrir fonte de ${track.title}`);
    actions.appendChild(source);

    item.appendChild(actions);
    list.appendChild(item);
  }

  content.appendChild(list);
  panel.appendChild(content);

  panel.setCurrentTrack = (trackId) => {
    for (const item of list.querySelectorAll('.soundtrack-track')) {
      const selected = item.dataset.trackId === trackId;
      item.classList.toggle('soundtrack-track--selected', selected);
      const button = buttonsById.get(item.dataset.trackId);
      if (button) {
        button.setAttribute('aria-pressed', String(selected));
        button.textContent = selected ? 'Player carregado' : 'Ouvir no player';
      }
    }
  };

  return panel;
}

export { tracks as SOUNDTRACK_TRACKS };
