import { LIVESTREAMS } from '../data/livestreams.js';

const ICON_BACK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
const ICON_FULLSCREEN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m13-5h3a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h3m13-5v3a2 2 0 0 1-2 2h-3"/></svg>';
const ICON_SIGNAL = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><path d="M8.5 8.5a5 5 0 0 0 0 7m7-7a5 5 0 0 1 0 7M5.5 5.5a9 9 0 0 0 0 13m13-13a9 9 0 0 1 0 13"/></svg>';

const ICON_CALL_VIDEO = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M18 10.48V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4.48l4 3.98v-11l-4 3.98Z"/><path d="M2 2l20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const ICON_CALL_MIC = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"/><path d="M17 11a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11h-2Z"/></svg>';
const ICON_CALL_SCREEN = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></svg>';
const ICON_CALL_MENU = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>';
const ICON_CALL_ANSWER = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="M20 15.5a12.4 12.4 0 0 1-3.9-.6 1.1 1.1 0 0 0-1.1.3l-2.2 2.2a16.5 16.5 0 0 1-7.2-7.2l2.2-2.2a1.1 1.1 0 0 0 .3-1.1A12.4 12.4 0 0 1 7.5 3 1 1 0 0 0 6.5 2H3a1 1 0 0 0-1 1A18 18 0 0 0 20 21a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1Z"/></svg>';
const ICON_CALL_CHEVRON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="m7 10 5 5 5-5z"/></svg>';

const STATUS_LABELS = {
  scheduled: 'AGENDADA',
  live: 'AO VIVO',
  ended: 'ENCERRADA',
};

// Rótulos e cores semânticas para cada classificação de checagem.
// Cores seguem a paleta existente do MasterWhats (tons neutros + sinalizadores funcionais).
const FACT_CHECK_META = {
  'CONFIRMADO POR DOCUMENTO': {
    label: 'Confirmado por documento',
    color: '#1a7a4a',
    bg: '#e8f5ee',
    darkBg: '#0d3320',
    darkColor: '#5ecf90',
  },
  'CONTRADITO POR DOCUMENTO': {
    label: 'Contradito por documento',
    color: '#b91c1c',
    bg: '#fef2f2',
    darkBg: '#3b0f0f',
    darkColor: '#f87171',
  },
  'PARCIALMENTE CONTEXTUALIZADO': {
    label: 'Parcialmente contextualizado',
    color: '#92400e',
    bg: '#fffbeb',
    darkBg: '#3b2000',
    darkColor: '#fbbf24',
  },
  'DECLARAÇÃO CONTESTADA': {
    label: 'Declaração contestada',
    color: '#5b21b6',
    bg: '#f5f3ff',
    darkBg: '#1e1033',
    darkColor: '#a78bfa',
  },
  'INFORMAÇÃO INSUFICIENTE': {
    label: 'Informação insuficiente',
    color: '#374151',
    bg: '#f3f4f6',
    darkBg: '#1f2937',
    darkColor: '#9ca3af',
  },
  'EM VERIFICAÇÃO': {
    label: 'Em verificação',
    color: '#1d4ed8',
    bg: '#eff6ff',
    darkBg: '#0f1f47',
    darkColor: '#93c5fd',
  },
  'CONFIRMADO POR REGISTRO OFICIAL': {
    label: 'Confirmado por registro oficial',
    color: '#1a7a4a',
    bg: '#e8f5ee',
    darkBg: '#0d3320',
    darkColor: '#5ecf90',
  },
  'DECLARAÇÃO REGISTRADA — CONTEXTO DOCUMENTAL PENDENTE': {
    label: 'Declaração registrada — pendente',
    color: '#1d4ed8',
    bg: '#eff6ff',
    darkBg: '#0f1f47',
    darkColor: '#93c5fd',
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatEventDate(date) {
  const [year, month, day] = date.split('-');
  return `${day}/${month}/${year}`;
}

function isYouTubeVideoId(value) {
  return typeof value === 'string' && /^[\w-]{11}$/.test(value);
}

function createStatus(event) {
  const status = document.createElement('span');
  status.className = `livestream-status livestream-status-${event.status}`;
  status.textContent = `${STATUS_LABELS[event.status] || 'STATUS NÃO INFORMADO'}${event.isTest ? ' · TESTE' : ''}`;
  return status;
}

/** Formata segundos como "1h23min" ou "4min32s", conforme a duração. */
function formatTimestamp(seconds) {
  if (seconds == null) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return m > 0 ? `${h}h${String(m).padStart(2, '0')}min` : `${h}h`;
  if (m > 0) return `${m}min${s > 0 ? String(s).padStart(2, '0') + 's' : ''}`;
  return `${s}s`;
}

// ---------------------------------------------------------------------------
// Fact-check panel (renderizado apenas quando event.factChecks existe)
// ---------------------------------------------------------------------------

/**
 * Cria o badge de classificação.
 * Usa inline style para as cores semânticas, mantendo coerência com qualquer
 * tema do MasterWhats sem exigir novas classes CSS globais.
 */
function createClassificationBadge(classification) {
  const meta = FACT_CHECK_META[classification];
  const badge = document.createElement('span');
  badge.className = 'fc-badge';
  badge.textContent = meta ? meta.label : classification;
  if (meta) {
    badge.style.setProperty('--fc-badge-color', meta.color);
    badge.style.setProperty('--fc-badge-bg', meta.bg);
  }
  return badge;
}


/**
 * Um link para um registro do acervo que, ao receber o mouse ou o foco,
 * abre a prévia da mensagem original logo abaixo.
 *
 * A prévia é carregada sob demanda e guardada em cache por item: passar o
 * mouse de novo não refaz a busca. Sem `loadMessagePreview`, o link continua
 * funcionando normalmente, apenas sem prévia.
 */
function createArchiveConvLink(conversation, loadMessagePreview) {
  const item = document.createElement('li');
  item.className = 'fc-archive-item';

  const link = document.createElement('a');
  link.className = 'fc-archive-link';
  link.href = conversation.messageId != null
    ? `#/chat/${encodeURIComponent(conversation.id)}/msg/${encodeURIComponent(conversation.messageId)}`
    : `#/chat/${encodeURIComponent(conversation.id)}`;
  link.textContent = conversation.title;
  item.appendChild(link);

  if (!loadMessagePreview || conversation.messageId == null) return item;

  const preview = document.createElement('div');
  preview.className = 'fc-preview';
  preview.hidden = true;
  item.appendChild(preview);

  let estado = 'vazio'; // vazio | carregando | pronto

  const desenhar = (message) => {
    preview.replaceChildren();
    if (!message) {
      const vazio = document.createElement('p');
      vazio.className = 'fc-preview-empty';
      vazio.textContent = 'Mensagem não localizada no acervo.';
      preview.appendChild(vazio);
      return;
    }

    const head = document.createElement('div');
    head.className = 'fc-preview-head';
    const who = document.createElement('strong');
    who.textContent = message.sender === 'DV' ? 'Daniel Vorcaro' : message.sender;
    const when = document.createElement('span');
    when.textContent = [message.date, message.time?.slice(0, 5)].filter(Boolean).join(' · ');
    head.append(who, when);
    preview.appendChild(head);

    const bubble = document.createElement('blockquote');
    bubble.className = `fc-preview-bubble${message.sender === 'DV' ? ' is-outgoing' : ''}`;
    // textContent: nada do acervo é interpretado como HTML
    bubble.textContent = message.content || '[sem texto recuperado]';
    preview.appendChild(bubble);

    if (message.source) {
      const origin = document.createElement('p');
      origin.className = 'fc-preview-source';
      origin.textContent = message.source_page
        ? `${message.source}, p. ${message.source_page}`
        : message.source;
      preview.appendChild(origin);
    }

    const open = document.createElement('span');
    open.className = 'fc-preview-open';
    open.textContent = 'Abrir a conversa no ponto da mensagem';
    preview.appendChild(open);
  };

  const abrir = async () => {
    preview.hidden = false;
    if (estado === 'pronto' || estado === 'carregando') return;
    estado = 'carregando';
    const carregando = document.createElement('p');
    carregando.className = 'fc-preview-loading';
    carregando.textContent = 'Carregando o registro…';
    preview.replaceChildren(carregando);
    try {
      desenhar(await loadMessagePreview(conversation.id, conversation.messageId));
    } catch {
      desenhar(null);
    }
    estado = 'pronto';
  };
  const fechar = () => { preview.hidden = true; };

  item.addEventListener('mouseenter', abrir);
  item.addEventListener('mouseleave', fechar);
  link.addEventListener('focus', abrir);
  link.addEventListener('blur', fechar);

  return item;
}

/**
 * Cria um item de checagem individual.
 * @param {object} check   - Um item de event.factChecks
 * @param {string} videoId - ID do vídeo YouTube do evento
 */
function createFactCheckItem(check, videoId, loadMessagePreview, onSeek) {
  const item = document.createElement('article');
  item.className = 'fc-item';
  item.dataset.checkId = check.id;

  // Cabeçalho: speaker + badge de classificação
  const header = document.createElement('header');
  header.className = 'fc-item-header';

  const speakerWrap = document.createElement('div');
  speakerWrap.className = 'fc-speaker';
  const speakerName = document.createElement('strong');
  speakerName.textContent = check.speaker;
  const speakerRole = document.createElement('span');
  speakerRole.textContent = check.speakerRole;
  speakerWrap.append(speakerName, speakerRole);

  header.append(speakerWrap, createClassificationBadge(check.classification));
  item.appendChild(header);

  // Declaração
  const statement = document.createElement('blockquote');
  statement.className = 'fc-statement';
  statement.textContent = check.statement;
  item.appendChild(statement);

  // Contexto
  const context = document.createElement('p');
  context.className = 'fc-context';
  context.textContent = check.context;
  item.appendChild(context);

  // Explicação da análise
  const explanationHeading = document.createElement('p');
  explanationHeading.className = 'fc-section-label';
  explanationHeading.textContent = 'Análise';
  const explanation = document.createElement('p');
  explanation.className = 'fc-explanation';
  explanation.textContent = check.explanation;
  item.append(explanationHeading, explanation);

  // Timestamp e link para o trecho no YouTube
  const timestampRow = document.createElement('div');
  timestampRow.className = 'fc-timestamp-row';
  if (check.timestampSeconds != null) {
    const formatted = formatTimestamp(check.timestampSeconds);

    // Salta no player da própria página
    const seek = document.createElement('button');
    seek.type = 'button';
    seek.className = 'fc-timestamp-link';
    seek.setAttribute('aria-label', `Ir para ${formatted} na gravação`);
    seek.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg> Assistir trecho — ${formatted}`;
    seek.addEventListener('click', () => onSeek?.(check.timestampSeconds));
    timestampRow.appendChild(seek);

    // Mesmo instante, aberto no YouTube
    const link = document.createElement('a');
    link.className = 'fc-timestamp-external';
    link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&t=${check.timestampSeconds}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'no YouTube';
    link.setAttribute('aria-label', `Abrir ${formatted} no YouTube`);
    timestampRow.appendChild(link);
  } else {
    const pending = document.createElement('span');
    pending.className = 'fc-timestamp-pending';
    pending.textContent = 'Trecho ainda não identificado na gravação';
    timestampRow.appendChild(pending);
  }
  item.appendChild(timestampRow);

  // Fontes
  if (check.sources?.length) {
    const sourcesHeading = document.createElement('p');
    sourcesHeading.className = 'fc-section-label';
    sourcesHeading.textContent = 'Fontes';
    const sourcesList = document.createElement('ul');
    sourcesList.className = 'fc-sources';
    for (const src of check.sources) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = src.url;
      a.textContent = src.title;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
      sourcesList.appendChild(li);
    }
    item.append(sourcesHeading, sourcesList);
  }

  // Registros no acervo MasterWhats
  const hasRelatedDocs = check.relatedMasterwhatsDocs?.length > 0;
  const hasRelatedConvs = check.relatedMasterwhatsConvs?.length > 0;

  const archiveHeading = document.createElement('p');
  archiveHeading.className = 'fc-section-label';
  archiveHeading.textContent = 'Acervo MasterWhats';

  if (check.archiveNote && (hasRelatedDocs || hasRelatedConvs)) {
    const note = document.createElement('p');
    note.className = 'fc-archive-note';
    note.textContent = check.archiveNote;
    item.append(archiveHeading, note);
    archiveHeading.dataset.placed = 'true';
  }

  if (!hasRelatedDocs && !hasRelatedConvs) {
    const none = document.createElement('p');
    none.className = 'fc-archive-empty';
    none.textContent = 'Nenhum registro relacionado localizado no acervo.';
    item.append(archiveHeading, none);
  } else {
    if (!archiveHeading.dataset.placed) item.appendChild(archiveHeading);
    if (hasRelatedDocs) {
      const docsList = document.createElement('ul');
      docsList.className = 'fc-archive-list';
      for (const doc of check.relatedMasterwhatsDocs) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = doc.url;
        a.textContent = doc.title;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        li.appendChild(a);
        docsList.appendChild(li);
      }
      item.appendChild(docsList);
    }
    if (hasRelatedConvs) {
      const convsList = document.createElement('ul');
      convsList.className = 'fc-archive-list';
      for (const conv of check.relatedMasterwhatsConvs) {
        convsList.appendChild(createArchiveConvLink(conv, loadMessagePreview));
      }
      item.appendChild(convsList);
    }
  }

  return item;
}

/**
 * Renderiza o painel lateral de checagem de fatos.
 * É inserido como segunda coluna no .livestream-stage quando o evento tem factChecks.
 */
function createFactCheckPanel(event, loadMessagePreview, onSeek) {
  const panel = document.createElement('aside');
  panel.className = 'fc-panel';
  panel.setAttribute('aria-label', 'Painel de checagem de fatos');

  const panelHeader = document.createElement('div');
  panelHeader.className = 'fc-panel-header';
  const panelTitle = document.createElement('h2');
  panelTitle.textContent = 'Checagem de fatos';
  const panelNote = document.createElement('p');
  panelNote.className = 'fc-panel-note';
  panelNote.textContent =
    'Verificações editoriais. Confirmar uma declaração não equivale a confirmar seu conteúdo.';
  panelHeader.append(panelTitle, panelNote);
  panel.appendChild(panelHeader);

  const list = document.createElement('div');
  list.className = 'fc-list';
  list.setAttribute('role', 'list');

  if (!event.factChecks?.length) {
    const empty = document.createElement('p');
    empty.className = 'fc-list-empty';
    empty.textContent = 'Nenhuma verificação disponível para esta transmissão.';
    list.appendChild(empty);
  } else {
    for (const check of event.factChecks) {
      const item = createFactCheckItem(check, event.youtubeVideoId, loadMessagePreview, onSeek);
      item.setAttribute('role', 'listitem');
      list.appendChild(item);
    }
  }

  panel.appendChild(list);
  return panel;
}

// ---------------------------------------------------------------------------
// Funções públicas (preservadas integralmente da implementação original)
// ---------------------------------------------------------------------------

/** Texto de estado, no lugar do "Ligando..." de uma chamada do WhatsApp. */
function callStatusLine(event) {
  if (event.status === 'live') return 'Ao vivo agora';
  if (event.status === 'ended') return `Gravação disponível · ${formatEventDate(event.date)}`;
  return `Chamando · ${formatEventDate(event.date)} às ${event.time.slice(0, 2)}h`;
}

/** Um dos controles decorativos da barra de chamada (câmera, microfone, tela). */
function callControl(icon, label, withChevron = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'livestream-call-control';
  button.disabled = true;
  button.setAttribute('aria-label', label);
  button.title = label;
  const glyph = document.createElement('span');
  glyph.className = 'livestream-call-control-icon';
  glyph.innerHTML = icon;
  button.appendChild(glyph);
  if (withChevron) {
    const chevron = document.createElement('span');
    chevron.className = 'livestream-call-chevron';
    chevron.innerHTML = ICON_CALL_CHEVRON;
    button.appendChild(chevron);
  }
  return button;
}

export function renderLivestreamHomeCall({ event = LIVESTREAMS[0], onOpen, avatarFor } = {}) {
  const card = document.createElement('section');
  card.className = 'empty-state-live livestream-call';
  card.setAttribute('aria-label', `MasterWhats ao vivo: ${event.title}`);

  // ---- Linha de identidade: avatar, título, estado ----
  const head = document.createElement('div');
  head.className = 'livestream-call-head';

  const avatar = document.createElement('span');
  avatar.className = 'livestream-call-avatar';
  const photo = avatarFor ? avatarFor(event.avatarConvId) : null;
  if (photo) {
    const img = document.createElement('img');
    img.src = photo;
    img.alt = '';
    avatar.appendChild(img);
  } else {
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = event.institutionInitials
      || event.institution.split(/\s+/).map(word => word[0]).join('').slice(0, 3).toLocaleUpperCase('pt-BR');
  }
  head.appendChild(avatar);

  const identity = document.createElement('div');
  identity.className = 'livestream-call-identity';
  const title = document.createElement('strong');
  title.className = 'livestream-call-title';
  title.textContent = event.title;
  // Estado e selo dividem a segunda linha, para o título ficar com a largura toda
  const stateRow = document.createElement('div');
  stateRow.className = 'livestream-call-state-row';
  const status = document.createElement('span');
  status.className = 'livestream-call-state';
  status.textContent = callStatusLine(event);
  stateRow.append(status, createStatus(event));
  identity.append(title, stateRow);
  head.appendChild(identity);
  card.appendChild(head);

  // ---- Barra de controles, como a de uma chamada ----
  const controls = document.createElement('div');
  controls.className = 'livestream-call-controls';
  controls.append(
    callControl(ICON_CALL_VIDEO, 'Câmera indisponível nesta transmissão', true),
    callControl(ICON_CALL_MIC, 'Microfone indisponível nesta transmissão', true),
    callControl(ICON_CALL_SCREEN, 'Compartilhamento de tela indisponível'),
    callControl(ICON_CALL_MENU, 'Mais opções'),
  );

  const answer = document.createElement('button');
  answer.type = 'button';
  answer.className = 'livestream-call-answer';
  answer.setAttribute('aria-label', `Ver transmissão: ${event.title}`);
  const answerIcon = document.createElement('span');
  answerIcon.className = 'livestream-call-answer-icon';
  answerIcon.innerHTML = ICON_CALL_ANSWER;
  answer.append(answerIcon, document.createTextNode('Ver transmissão'));
  answer.addEventListener('click', () => onOpen?.(event.id));
  controls.appendChild(answer);

  card.appendChild(controls);
  return card;
}

export function renderLivestreamPanel({ event = LIVESTREAMS[0], onBack, avatarFor, loadMessagePreview } = {}) {
  const panel = document.createElement('section');
  panel.className = 'livestream-panel';
  panel.setAttribute('aria-label', `Transmissão: ${event.title}`);

  // ---- Header (preservado) ----
  const header = document.createElement('header');
  header.className = 'livestream-header';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'livestream-back';
  back.setAttribute('aria-label', 'Voltar para conversas');
  back.innerHTML = ICON_BACK;
  back.addEventListener('click', onBack || (() => {}));
  header.appendChild(back);

  const heading = document.createElement('div');
  heading.className = 'livestream-heading';
  const eyebrow = document.createElement('p');
  eyebrow.className = 'livestream-eyebrow';
  eyebrow.textContent = 'MASTERWHATS AO VIVO';
  const title = document.createElement('h1');
  title.textContent = event.title;
  heading.append(eyebrow, title);
  const institutionMark = document.createElement('span');
  institutionMark.className = 'livestream-institution-mark';
  institutionMark.textContent = 'SF';
  institutionMark.setAttribute('aria-label', event.institution);
  header.append(institutionMark, heading, createStatus(event));
  panel.appendChild(header);

  // ---- Body ----
  const body = document.createElement('div');
  body.className = 'livestream-body';

  // O .livestream-stage recebe a classe adicional se o evento tiver checagem de fatos
  const hasFactChecks = Array.isArray(event.factChecks) && event.factChecks.length >= 0 && event.isTest;
  const stage = document.createElement('div');
  stage.className = hasFactChecks
    ? 'livestream-stage livestream-stage-with-fc'
    : 'livestream-stage';

  const hasVideo = isYouTubeVideoId(event.youtubeVideoId);

  // Coluna do vídeo (wrapper para o grid de duas colunas)
  const videoCol = document.createElement('div');
  videoCol.className = hasFactChecks ? 'fc-video-col' : '';

  // Definido abaixo quando há vídeo; sem vídeo o botão de trecho não aparece.
  let seekToSecond = null;

  if (hasVideo) {
    const frame = document.createElement('iframe');
    frame.className = 'livestream-frame';
    const embedBase = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(event.youtubeVideoId)}`;
    frame.src = `${embedBase}?enablejsapi=1`;

    /**
     * Leva a gravação ao segundo pedido.
     *
     * Tenta primeiro a API do player, que mantém o vídeo carregado. Se ela
     * não respondeu (o player só a habilita depois de inicializar), recarrega
     * o embed já no ponto certo — mais lento, porém determinístico.
     */
    seekToSecond = (seconds) => {
      const alvo = Math.max(0, Math.floor(Number(seconds) || 0));
      let respondeu = false;
      const ouvir = () => { respondeu = true; };
      window.addEventListener('message', ouvir);
      try {
        frame.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [alvo, true] }),
          'https://www.youtube-nocookie.com',
        );
        frame.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          'https://www.youtube-nocookie.com',
        );
      } catch {
        respondeu = false;
      }
      setTimeout(() => {
        window.removeEventListener('message', ouvir);
        if (!respondeu) frame.src = `${embedBase}?enablejsapi=1&start=${alvo}&autoplay=1`;
      }, 250);
      frame.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    frame.title = `Transmissão: ${event.title}`;
    frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    frame.allowFullscreen = true;
    videoCol.appendChild(frame);
  } else {
    stage.classList.add('livestream-stage-waiting');
    const waiting = document.createElement('div');
    waiting.className = 'livestream-waiting';
    const playIcon = document.createElement('span');
    playIcon.className = 'livestream-waiting-icon';
    playIcon.innerHTML = ICON_SIGNAL;
    const message = document.createElement('h2');
    message.textContent = 'A TRANSMISSÃO AINDA NÃO ESTÁ DISPONÍVEL';
    const detail = document.createElement('p');
    detail.textContent = 'O Senado Federal ainda não disponibilizou o link da transmissão.';
    const note = document.createElement('p');
    note.className = 'livestream-waiting-note';
    note.textContent = 'Esta página está preparada para receber o sinal oficial da audiência.';
    waiting.append(playIcon, message, detail, note);
    videoCol.appendChild(waiting);
  }

  stage.appendChild(videoCol);

  // Painel de checagem (apenas para eventos com factChecks)
  if (hasFactChecks) {
    stage.appendChild(createFactCheckPanel(event, loadMessagePreview, seekToSecond));
  }

  body.appendChild(stage);

  // ---- Controles (preservados) ----
  const controls = document.createElement('div');
  controls.className = 'livestream-controls';
  const institution = document.createElement('p');
  institution.className = 'livestream-institution';
  institution.textContent = event.institution;
  controls.appendChild(institution);

  if (hasVideo) {
    const frame = videoCol.querySelector('iframe');
    const fullscreen = document.createElement('button');
    fullscreen.type = 'button';
    fullscreen.className = 'livestream-control-button';
    fullscreen.setAttribute('aria-label', 'Expandir transmissão para tela cheia');
    fullscreen.title = 'Tela cheia';
    fullscreen.innerHTML = ICON_FULLSCREEN;
    fullscreen.addEventListener('click', () => frame.requestFullscreen?.());
    controls.appendChild(fullscreen);

    const youtubeLink = document.createElement('a');
    youtubeLink.className = 'livestream-youtube-link';
    youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(event.youtubeVideoId)}`;
    youtubeLink.target = '_blank';
    youtubeLink.rel = 'noopener noreferrer';
    youtubeLink.textContent = 'Abrir no YouTube';
    controls.appendChild(youtubeLink);
  }
  if (event.officialUrl) {
    const officialLink = document.createElement('a');
    officialLink.className = 'livestream-youtube-link';
    officialLink.href = event.officialUrl;
    officialLink.target = '_blank';
    officialLink.rel = 'noopener noreferrer';
    officialLink.textContent = 'Página oficial';
    controls.appendChild(officialLink);
  }
  body.appendChild(controls);

  // ---- Detalhes (preservados) ----
  const details = document.createElement('div');
  details.className = 'livestream-details';
  const date = document.createElement('p');
  date.className = 'livestream-date';
  date.textContent = `${formatEventDate(event.date)} · ${event.time.slice(0, 2)}h`;
  details.appendChild(date);

  const peopleHeading = document.createElement('h2');
  peopleHeading.textContent = 'Participantes previstos';
  details.appendChild(peopleHeading);
  const people = document.createElement('ul');
  for (const participant of event.participants) {
    const person = document.createElement('li');

    const avatar = document.createElement('span');
    avatar.className = 'livestream-person-avatar';
    const photoSrc = avatarFor ? avatarFor(participant.avatarConvId) : null;
    if (photoSrc) {
      avatar.classList.add('livestream-person-avatar--photo');
      const img = document.createElement('img');
      img.src = photoSrc;
      img.alt = '';
      img.className = 'livestream-person-avatar-img';
      avatar.appendChild(img);
    } else {
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = participant.name
        .split(/\s+/)
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toLocaleUpperCase('pt-BR');
    }

    const identity = document.createElement('div');
    identity.className = 'livestream-person-identity';
    const name = document.createElement('strong');
    name.textContent = participant.name;
    const role = document.createElement('span');
    role.textContent = participant.role;
    identity.append(name, role);
    person.append(avatar, identity);
    people.appendChild(person);
  }
  details.appendChild(people);

  if (event.description) {
    const description = document.createElement('p');
    description.className = 'livestream-description';
    description.textContent = event.description;
    details.appendChild(description);
  }
  if (event.documents?.length) {
    const documentsHeading = document.createElement('h2');
    documentsHeading.textContent = 'Documentos relacionados';
    details.appendChild(documentsHeading);
    const documents = document.createElement('ul');
    documents.className = 'livestream-related';
    for (const documentInfo of event.documents) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = documentInfo.url;
      link.textContent = documentInfo.title;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      item.appendChild(link);
      documents.appendChild(item);
    }
    details.appendChild(documents);
  }
  if (event.relatedConversations?.length) {
    const conversationsHeading = document.createElement('h2');
    conversationsHeading.textContent = 'Conversas relacionadas';
    details.appendChild(conversationsHeading);
    const conversations = document.createElement('ul');
    conversations.className = 'livestream-related';
    for (const conversation of event.relatedConversations) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#/chat/${encodeURIComponent(conversation.id)}`;
      link.textContent = conversation.title;
      item.appendChild(link);
      conversations.appendChild(item);
    }
    details.appendChild(conversations);
  }
  body.appendChild(details);
  panel.appendChild(body);
  return panel;
}