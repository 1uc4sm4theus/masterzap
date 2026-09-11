/**
 * ChatView component — renders the chat header and message area.
 * Integrates with ScrollLoader for lazy day-chunk loading.
 *
 * Security note: innerHTML is used in two controlled scenarios:
 * 1. Static SVG icons (BACK_ICON) and generated avatars — no user data
 * 2. Message text — escapeHtml() runs FIRST to neutralize all HTML,
 *    then linkify() wraps plain-text URLs in <a> tags. This is safe
 *    because the input to linkify is already fully escaped.
 */
import { escapeHtml, formatTime, formatDateLong, linkify } from '../lib/utils.js';
import { ScrollLoader } from '../lib/scroll-loader.js';
import { ICON_INFO, ICON_SEARCH, ICON_CHECKEMPTY, ICON_BELL, ICON_TIMER, ICON_DOWNLOAD, ICON_CLOSE_CIRCULAR, ICON_MASTERZAP_LOGO, ICON_MEETBALL, ICON_CHEVRON_DW, ICON_SCREENSHOT } from '../lib/icons.js';

import { defaultAvatarSvg } from '../lib/avatar.js';
import { parseContacts, parseLocation, mapsUrl, parseLink, parseAudio, parseImage, conversationForPhone } from '../lib/media.js';
import { showContactsSheet, ICON_MESSAGE } from './ContactsSheet.js';

/**
 * What the media renderers need from outside the bubble: who the contacts
 * are, where the avatars live, how to open a chat or copy a number. Set once
 * per chat view; there is only ever one on screen.
 */
let media = { conversations: [], avatarFor: () => null, selfAvatar: null, contactAvatar: null, contactName: '', onOpenChat: () => {}, onCopy: () => {}, container: null };

const ICON_PLAY = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
const ICON_PAUSE = `<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>`;
const MAP_PLACEHOLDER = '/assets/map-placeholder.jpg';
const MAP_PIN = '/assets/map-pin.jpg';

const BACK_ICON = `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`;


/**
 * Render a single day section with date badge + messages.
 * @param {string} date - ISO date string
 * @param {Array} messages
 * @returns {HTMLElement}
 */
function renderDaySection(date, messages, outgoingSender = 'DV', ownerName = 'Daniel Vorcaro') {
  const section = document.createElement('section');
  section.className = 'chat-day';
  section.dataset.date = date;

  // Date badge
  const badge = document.createElement('div');
  badge.className = 'chat-date-badge';
  badge.textContent = formatDateLong(date);
  section.appendChild(badge);

  // Messages
  for (const msg of messages) {
    section.appendChild(renderMessage(msg, outgoingSender, ownerName));
  }

  return section;
}

// ── SVG Icons for message types ──────────────────

const ICON_CAMERA = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`;

const ICON_VIDEO = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>`;

const ICON_MIC = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>`;

const ICON_DOC = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;

const ICON_PHONE = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>`;

const ICON_BLOCK = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`;

/**
 * Render a media placeholder (image/video/sticker).
 *
 * The box grows with its caption: a screenshot of a whole exchange was
 * transcribed into some of these, and text must never leave the grey area.
 */
function renderMediaPlaceholder(type, msg) {
  const el = document.createElement('div');
  el.className = `chat-media-placeholder chat-media-${type}`;

  const iconEl = document.createElement('span');
  iconEl.className = 'chat-media-icon';
  // Static SVG — safe innerHTML
  iconEl.innerHTML = type === 'video' ? ICON_VIDEO : ICON_CAMERA;
  el.appendChild(iconEl);

  const image = type === 'image' ? parseImage(msg.content) : null;

  const label = document.createElement('span');
  label.className = 'chat-media-label';
  const labels = { image: 'Foto', video: 'Vídeo', sticker: 'Sticker' };
  label.textContent = image ? image.label : (labels[type] || type);
  el.appendChild(label);

  if (image?.note) {
    const note = document.createElement('div');
    note.className = 'chat-media-note';
    note.textContent = image.note;
    el.appendChild(note);
  }

  const captionText = image ? image.caption : (msg.content || '');
  if (captionText) {
    const caption = document.createElement('div');
    caption.className = 'chat-media-caption';
    caption.textContent = captionText;
    el.appendChild(caption);
  }

  return el;
}

/** A round avatar: the photograph when there is one, the coloured initial otherwise. */
function avatarEl(src, name, size, className) {
  const wrap = document.createElement('span');
  wrap.className = className;
  if (src) {
    const img = document.createElement('img');
    img.src = src;
    img.alt = name;
    wrap.appendChild(img);
  } else {
    wrap.innerHTML = defaultAvatarSvg(name || '?', size);
  }
  return wrap;
}

/**
 * A voice message as WhatsApp draws it — play, waveform, the sender's photo —
 * with the transcript underneath. The audio itself is not in the material;
 * the play button says so by being disabled.
 */
function renderAudioMessage(msg, isOutgoing, ownerName = 'Daniel Vorcaro') {
  const { transcript } = parseAudio(msg.content);
  const el = document.createElement('div');
  el.className = 'chat-audio';

  const audio = msg.audio_src ? new Audio(msg.audio_src) : null;
  if (audio) {
    audio.preload = 'metadata';
    audio.className = 'chat-audio-native';
    audio.setAttribute('aria-label', 'Mensagem de áudio');
    el.appendChild(audio);
  }

  const row = document.createElement('div');
  row.className = 'chat-audio-row';

  const play = document.createElement('button');
  play.className = 'chat-audio-play';
  play.disabled = !audio;
  play.setAttribute('aria-label', audio ? 'Reproduzir áudio' : 'Áudio não disponível');
  play.innerHTML = ICON_PLAY;
  row.appendChild(play);

  const waveform = document.createElement('div');
  waveform.className = 'chat-audio-waveform';
  for (let i = 0; i < 34; i++) {
    const bar = document.createElement('span');
    bar.className = 'chat-audio-bar';
    bar.style.height = `${4 + ((i * 7919) % 17)}px`;
    bar.dataset.index = i;
    waveform.appendChild(bar);
  }
  row.appendChild(waveform);

  const duration = document.createElement('span');
  duration.className = 'chat-audio-duration';
  duration.textContent = '--:--';
  row.appendChild(duration);

  const who = avatarEl(isOutgoing ? media.selfAvatar : media.contactAvatar,
    isOutgoing ? ownerName : media.contactName, 40, 'chat-audio-avatar');
  const mic = document.createElement('span');
  mic.className = 'chat-audio-mic';
  mic.innerHTML = ICON_MIC;
  who.appendChild(mic);
  row.appendChild(who);
  el.appendChild(row);

  const foot = document.createElement('div');
  foot.className = 'chat-audio-foot';
  foot.textContent = 'Áudio não recuperado · transcrição da perícia';
  el.appendChild(foot);

  const formatAudioTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  if (audio) {
    const bars = [...waveform.children];
    const updateProgress = () => {
      const ratio = audio.duration ? audio.currentTime / audio.duration : 0;
      bars.forEach((bar, index) => bar.classList.toggle('played', index / bars.length < ratio));
      duration.textContent = formatAudioTime(audio.duration || audio.currentTime);
    };
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', () => {
      play.innerHTML = ICON_PLAY;
      play.setAttribute('aria-label', 'Reproduzir áudio');
      updateProgress();
    });
    audio.addEventListener('error', () => {
      play.disabled = true;
      play.setAttribute('aria-label', 'Áudio não disponível');
    });
    play.addEventListener('click', () => {
      if (audio.paused) {
        audio.play().then(() => {
          play.innerHTML = ICON_PAUSE;
          play.setAttribute('aria-label', 'Pausar áudio');
        }).catch(() => {
          play.disabled = true;
          play.setAttribute('aria-label', 'Áudio não disponível');
        });
      } else {
        audio.pause();
        play.innerHTML = ICON_PLAY;
        play.setAttribute('aria-label', 'Reproduzir áudio');
      }
    });
    waveform.addEventListener('click', (event) => {
      if (!audio.duration) return;
      const rect = waveform.getBoundingClientRect();
      audio.currentTime = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * audio.duration;
      updateProgress();
    });
  }

  if (transcript) {
    const t = document.createElement('div');
    t.className = 'chat-audio-transcript';
    t.textContent = `\u201C${transcript}\u201D`;
    el.appendChild(t);
  }
  return el;
}

/** A shared location: the map with a pin, the place and its address; opens on Google Maps. */
function renderLocationCard(msg) {
  const loc = parseLocation(msg.content);
  const a = document.createElement('a');
  a.className = 'chat-location-card';
  a.href = mapsUrl(loc);
  a.target = '_blank';
  a.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.className = 'chat-location-map';
  img.src = MAP_PIN;
  img.alt = 'Mapa';
  a.appendChild(img);

  const body = document.createElement('div');
  body.className = 'chat-location-body';
  const place = document.createElement('span');
  place.className = 'chat-location-place';
  place.textContent = loc.place;
  body.appendChild(place);
  if (loc.address) {
    const addr = document.createElement('span');
    addr.className = 'chat-location-address';
    addr.textContent = loc.address;
    body.appendChild(addr);
  }
  a.appendChild(body);
  return a;
}

/**
 * A link with its preview, as WhatsApp shows one: the card on top (a map
 * thumbnail for Google Maps, the title and description for anything else)
 * and the address itself underneath, clickable, opening in a new tab.
 */
function renderLinkMessage(msg) {
  const link = parseLink(msg.content);
  const frag = document.createDocumentFragment();
  if (!link.url) {
    const t = document.createElement('span');
    t.textContent = msg.content || '';
    frag.appendChild(t);
    return frag;
  }

  const card = document.createElement('a');
  card.className = `chat-link-card${link.isMap ? ' is-map' : ''}`;
  card.href = link.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  if (link.isMap) {
    const img = document.createElement('img');
    img.className = 'chat-link-thumb';
    img.src = MAP_PLACEHOLDER;
    img.alt = '';
    card.appendChild(img);
  }
  const body = document.createElement('div');
  body.className = 'chat-link-body';
  const title = document.createElement('span');
  title.className = 'chat-link-title';
  title.textContent = link.title || link.host;
  body.appendChild(title);
  if (link.description) {
    const desc = document.createElement('span');
    desc.className = 'chat-link-desc';
    desc.textContent = link.description;
    body.appendChild(desc);
  }
  const host = document.createElement('span');
  host.className = 'chat-link-host';
  host.textContent = link.host;
  body.appendChild(host);
  card.appendChild(body);
  frag.appendChild(card);

  const url = document.createElement('a');
  url.className = 'chat-link-url';
  url.href = link.url;
  url.target = '_blank';
  url.rel = 'noopener noreferrer';
  url.textContent = link.url;
  frag.appendChild(url);

  if (link.extra) {
    const extra = document.createElement('div');
    extra.className = 'chat-link-extra';
    extra.textContent = link.extra;
    frag.appendChild(extra);
  }
  return frag;
}

/**
 * A contact card. One person: photo, name, and "Enviar mensagem" — which
 * opens the chat if Vorcaro had one with that number, and copies the number
 * otherwise. Several entries: the first one and "Ver todos".
 */
function renderContactCard(msg) {
  const contacts = parseContacts(msg.content);
  const el = document.createElement('div');
  el.className = 'chat-contact-card';
  if (!contacts.length) {
    el.textContent = msg.content || '';
    return el;
  }
  const first = contacts[0];
  const match = conversationForPhone(first.phone, media.conversations);

  const head = document.createElement('div');
  head.className = 'chat-contact-head';
  head.appendChild(avatarEl(match ? media.avatarFor(match.id) : null, first.name, 44, 'chat-contact-avatar'));
  const names = document.createElement('div');
  names.className = 'chat-contact-names';
  const name = document.createElement('span');
  name.className = 'chat-contact-name';
  name.textContent = first.name;
  names.appendChild(name);
  const sub = document.createElement('span');
  sub.className = 'chat-contact-sub';
  sub.textContent = contacts.length > 1
    ? `e mais ${contacts.length - 1} contato${contacts.length > 2 ? 's' : ''}`
    : (first.org || first.phone || '');
  if (sub.textContent) names.appendChild(sub);
  head.appendChild(names);
  el.appendChild(head);

  const actions = document.createElement('div');
  actions.className = 'chat-contact-actions';
  if (contacts.length > 1) {
    const all = document.createElement('button');
    all.className = 'chat-contact-action';
    all.textContent = 'Ver todos';
    all.addEventListener('click', () => showContactsSheet(media.container, contacts, media));
    actions.appendChild(all);
  } else if (first.phone) {
    const send = document.createElement('button');
    send.className = 'chat-contact-action';
    send.innerHTML = `${ICON_MESSAGE}<span>${match ? 'Enviar mensagem' : 'Copiar número'}</span>`;
    send.addEventListener('click', () => {
      if (match) media.onOpenChat(match.id); else media.onCopy(first.phone, 'Número copiado');
    });
    actions.appendChild(send);
  }
  if (actions.childNodes.length) el.appendChild(actions);
  return el;
}

/**
 * Render a document attachment card.
 */
function renderDocumentCard(msg) {
  const el = document.createElement('div');
  el.className = 'chat-document-card';

  const iconEl = document.createElement('span');
  iconEl.className = 'chat-document-icon';
  // Static SVG — safe innerHTML
  iconEl.innerHTML = ICON_DOC;
  el.appendChild(iconEl);

  const info = document.createElement('div');
  info.className = 'chat-document-info';

  const name = document.createElement('span');
  name.className = 'chat-document-name';
  name.textContent = msg.attachment || 'Documento';
  info.appendChild(name);

  if (msg.content) {
    const desc = document.createElement('span');
    desc.className = 'chat-document-desc';
    desc.textContent = msg.content;
    info.appendChild(desc);
  }

  el.appendChild(info);
  return el;
}

/**
 * Render a call notification card.
 */
function renderCallCard(msg) {
  const el = document.createElement('div');
  el.className = 'chat-call-card';

  const iconEl = document.createElement('span');
  iconEl.className = 'chat-call-icon';
  // Static SVG — safe innerHTML
  iconEl.innerHTML = ICON_PHONE;
  el.appendChild(iconEl);

  const label = document.createElement('span');
  label.className = 'chat-call-label';
  label.textContent = msg.content || 'Chamada';
  el.appendChild(label);

  return el;
}

/**
 * Render a deleted message indicator.
 */
function renderDeletedMessage() {
  const el = document.createElement('div');
  el.className = 'chat-deleted-msg';

  const iconEl = document.createElement('span');
  iconEl.className = 'chat-deleted-icon';
  // Static SVG — safe innerHTML
  iconEl.innerHTML = ICON_BLOCK;
  el.appendChild(iconEl);

  const label = document.createElement('span');
  label.textContent = 'Mensagem apagada';
  el.appendChild(label);

  return el;
}

/**
 * Render a single message bubble.
 * @param {object} msg
 * @returns {HTMLElement}
 */
function renderMessage(msg, outgoingSender = 'DV', ownerName = 'Daniel Vorcaro') {
  const isOutgoing = msg.sender === outgoingSender;
  const isSystem = msg.type === 'system';

  const row = document.createElement('div');
  row.className = `chat-msg-row ${isOutgoing ? 'outgoing' : 'incoming'}${isSystem ? ' system' : ''}`;
  row.dataset.id = msg.id;

  if (isSystem) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-system';
    bubble.textContent = msg.content;
    row.appendChild(bubble);
    return row;
  }

  const bubble = document.createElement('div');
  bubble.className = `chat-msg-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`;

  const content = document.createElement('div');
  content.className = 'chat-msg-content';

  switch (msg.type) {
    case 'image':
      content.appendChild(renderMediaPlaceholder('image', msg));
      break;
    case 'video':
      content.appendChild(renderMediaPlaceholder('video', msg));
      break;
    case 'audio':
      content.appendChild(renderAudioMessage(msg, isOutgoing, ownerName));
      break;
    case 'image_view_once':
      content.appendChild(renderMediaPlaceholder('image', msg));
      break;
    case 'location':
      content.appendChild(renderLocationCard(msg));
      break;
    case 'link':
      content.appendChild(renderLinkMessage(msg));
      break;
    case 'contact':
      content.appendChild(renderContactCard(msg));
      break;
    case 'sticker':
      content.appendChild(renderMediaPlaceholder('sticker', msg));
      break;
    case 'document':
      content.appendChild(renderDocumentCard(msg));
      break;
    case 'deleted':
      content.appendChild(renderDeletedMessage());
      break;
    case 'call':
      content.appendChild(renderCallCard(msg));
      break;
    default: {
      // Text: escapeHtml first (neutralizes ALL HTML), then linkify wraps URLs in <a>
      const escaped = escapeHtml(msg.content || '');
      content.innerHTML = linkify(escaped);
      // Vorcaro's notes to Moraes were screenshots sent to vanish; the text
      // exists because the forensics recovered them. Say so, quietly.
      if (msg.view_once) {
        const tag = document.createElement('div');
        tag.className = 'chat-view-once-tag';
        tag.textContent = 'Visualização única · print do bloco de notas, recuperado pela perícia';
        content.prepend(tag);
      }
      break;
    }
  }

  bubble.appendChild(content);

  // Metadata row (time + edited flag)
  const meta = document.createElement('span');
  meta.className = 'chat-msg-meta';
  meta.textContent = formatTime(msg.time);
  if (msg.is_edited) {
    const edited = document.createElement('span');
    edited.className = 'chat-msg-edited';
    edited.textContent = 'editada';
    meta.prepend(edited);
  }
  bubble.appendChild(meta);

  // Tail (the little triangle on the bubble)
  const tail = document.createElement('span');
  tail.className = 'chat-msg-tail';
  bubble.appendChild(tail);

  // Chevron dropdown trigger (visible on hover)
  const chevron = document.createElement('button');
  chevron.className = 'chat-msg-chevron';
  chevron.setAttribute('aria-label', 'Menu da mensagem');
  chevron.innerHTML = ICON_CHEVRON_DW;
  bubble.appendChild(chevron);

  row.appendChild(bubble);
  return row;
}

/**
 * Render the full chat view for a conversation.
 * @param {HTMLElement} container - the main-area element
 * @param {object} options
 * @param {object} options.conversation - conversation metadata
 * @param {Array} options.dateIndex - date index from DataStore
 * @param {function} options.loadMessages - async (date) => messages[]
 * @param {function} [options.onBack] - back button callback
 * @returns {{ element: HTMLElement, loader: ScrollLoader }}
 */
// Use the design system meetball icon for 3-dot menu

export function renderChatView(container, { conversation, dateIndex, loadMessages, onBack, onContactClick, onSearch, onCloseChat, onAbout, onScreenshot, onExport, onMenuOpen, outgoingSender = 'DV', ownerName = 'Daniel Vorcaro', media: mediaOptions }) {
  if (mediaOptions) media = { ...media, ...mediaOptions, container };
  // Clear container
  while (container.firstChild) container.removeChild(container.firstChild);

  const el = document.createElement('div');
  el.className = 'chat-view';

  // Header
  const displayName = conversation.contact || conversation.participants.find(p => p !== outgoingSender) || conversation.participants[0];

  const header = document.createElement('header');
  header.className = 'chat-header';

  // Back button (useful for mobile, hidden on desktop via CSS)
  const backBtn = document.createElement('button');
  backBtn.className = 'chat-header-back';
  backBtn.setAttribute('aria-label', 'Voltar');
  // Static SVG icon — safe innerHTML
  backBtn.innerHTML = BACK_ICON;
  if (onBack) backBtn.addEventListener('click', onBack);
  header.appendChild(backBtn);

  const avatarEl = document.createElement('div');
  avatarEl.className = 'chat-header-avatar';
  if (conversation.avatar) {
    const img = document.createElement('img');
    img.src = conversation.avatar;
    img.alt = displayName;
    img.className = 'chat-header-avatar-img';
    avatarEl.appendChild(img);
  } else {
    // Generated SVG — no user data, safe innerHTML
    avatarEl.innerHTML = defaultAvatarSvg(conversation.id, 40);
  }
  if (onContactClick) {
    avatarEl.style.cursor = 'pointer';
    avatarEl.addEventListener('click', onContactClick);
  }
  header.appendChild(avatarEl);

  const infoEl = document.createElement('div');
  infoEl.className = 'chat-header-info-wrapper';
  if (onContactClick) {
    infoEl.style.cursor = 'pointer';
    infoEl.addEventListener('click', onContactClick);
  }

  const nameEl = document.createElement('div');
  nameEl.className = 'chat-header-name';
  nameEl.textContent = displayName;
  infoEl.appendChild(nameEl);

  const subtitleEl = document.createElement('div');
  subtitleEl.className = 'chat-header-info';
  subtitleEl.textContent = `${conversation.total_messages.toLocaleString('pt-BR')} mensagens`;
  infoEl.appendChild(subtitleEl);

  header.appendChild(infoEl);

  // Search button in header
  const searchBtn = document.createElement('button');
  searchBtn.className = 'chat-header-menu-btn';
  searchBtn.setAttribute('aria-label', 'Pesquisar');
  searchBtn.innerHTML = ICON_SEARCH;
  if (onSearch) searchBtn.addEventListener('click', onSearch);
  header.appendChild(searchBtn);

  // 3-dot menu button
  const menuBtn = document.createElement('button');
  menuBtn.className = 'chat-header-menu-btn';
  menuBtn.setAttribute('aria-label', 'Menu');
  // Static SVG — safe innerHTML
  menuBtn.innerHTML = ICON_MEETBALL;
  header.appendChild(menuBtn);

  // Dropdown menu (hidden by default)
  let menuOpen = false;
  let menuEl = null;

  function buildMenuEl() {
    const m = document.createElement('div');
    m.className = 'chat-dropdown-menu';

    const items = [
      { label: 'Info do contato', icon: ICON_INFO, action: onContactClick, enabled: !!onContactClick },
      { label: 'Pesquisar', icon: ICON_SEARCH, action: onSearch, enabled: !!onSearch },
      { label: 'Selecionar mensagens', icon: ICON_CHECKEMPTY, action: null, enabled: false },
      { label: 'Modo silencioso', icon: ICON_BELL, action: null, enabled: false },
      { label: 'Mensagens temporárias', icon: ICON_TIMER, action: null, enabled: false },
      { label: 'Compartilhar print', icon: ICON_SCREENSHOT, action: onScreenshot, enabled: !!onScreenshot },
      { label: 'Exportar (.md)', icon: ICON_DOWNLOAD, action: () => onExport('md'), enabled: !!onExport },
      { label: 'Exportar (.json)', icon: ICON_DOWNLOAD, action: () => onExport('json'), enabled: !!onExport },
      { label: 'Fechar conversa', icon: ICON_CLOSE_CIRCULAR, action: onCloseChat || onBack, enabled: !!(onCloseChat || onBack) },
      { label: 'Sobre o MasterWhats', icon: ICON_MASTERZAP_LOGO, action: onAbout, enabled: !!onAbout },
    ];

    for (const item of items) {
      const btn = document.createElement('button');
      btn.className = 'chat-dropdown-item';
      if (!item.enabled) btn.classList.add('disabled');
      // Static SVG icons from icons.js + static labels — safe innerHTML
      if (item.icon) {
        btn.innerHTML = `<span class="chat-dropdown-icon">${item.icon}</span><span>${item.label}</span>`;
      } else {
        btn.textContent = item.label;
      }
      if (item.enabled && item.action) {
        btn.addEventListener('click', () => { closeMenu(); item.action(); });
      }
      m.appendChild(btn);
    }
    return m;
  }

  function toggleMenu() {
    if (menuOpen) { closeMenu(); return; }
    menuEl = buildMenuEl();
    header.appendChild(menuEl);
    menuOpen = true;
    // Give the screenshot a head start: capturing takes seconds, and the tap
    // that follows has to still be live when navigator.share() is reached.
    if (onMenuOpen) onMenuOpen();
    setTimeout(() => {
      document.addEventListener('click', onOutsideClick, true);
    }, 0);
  }

  function showMenuAt(x, y) {
    closeMenu();
    menuEl = buildMenuEl();
    if (onMenuOpen) onMenuOpen();
    menuEl.style.position = 'fixed';
    menuEl.style.top = `${y}px`;
    menuEl.style.left = `${x}px`;
    menuEl.style.right = 'auto';

    document.body.appendChild(menuEl);

    // Adjust if overflowing viewport
    const rect = menuEl.getBoundingClientRect();
    if (rect.right > window.innerWidth) menuEl.style.left = `${window.innerWidth - rect.width - 8}px`;
    if (rect.bottom > window.innerHeight) menuEl.style.top = `${window.innerHeight - rect.height - 8}px`;

    menuOpen = true;
    setTimeout(() => {
      document.addEventListener('click', onOutsideClick, true);
    }, 0);
  }

  function closeMenu() {
    if (menuEl) { menuEl.remove(); menuEl = null; }
    menuOpen = false;
    document.removeEventListener('click', onOutsideClick, true);
    document.removeEventListener('contextmenu', onOutsideClick, true);
  }

  function onOutsideClick(e) {
    if (menuEl && !menuEl.contains(e.target) && e.target !== menuBtn) {
      closeMenu();
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });


  el.appendChild(header);

  // Messages area
  const messagesArea = document.createElement('div');
  messagesArea.className = 'chat-messages';
  messagesArea.setAttribute('role', 'log');
  messagesArea.setAttribute('aria-label', `Mensagens com ${displayName}`);
  el.appendChild(messagesArea);

  // Right-click on chat background (not on bubbles) opens dropdown at mouse position
  messagesArea.addEventListener('contextmenu', (e) => {
    const bubble = e.target.closest('.chat-msg-bubble, .chat-msg-system, .context-menu');
    if (bubble) return;
    e.preventDefault();
    showMenuAt(e.clientX, e.clientY);
  });

  container.appendChild(el);

  // Set up scroll loader
  const loader = new ScrollLoader({
    container: messagesArea,
    dateIndex,
    loadMessages,
    renderDay: (date, messages) => renderDaySection(date, messages, outgoingSender, ownerName),
  });

  return { element: el, loader };
}

// Export for testing
export { renderDaySection, renderMessage };
