/**
 * The Calls screen lists calls recorded in the material, newest first.
 * Rows distinguish incoming and outgoing calls; missed incoming calls are
 * highlighted. Selecting a row opens its message in the conversation.
 */

import { defaultAvatarSvg } from '../lib/avatar.js';
import { ICON_SEARCH, ICON_MEETBALL } from '../lib/icons.js';

const ICON_PHONE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
const ICON_VIDEO = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>';
const ICON_CALENDAR = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const ICON_KEYPAD = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="6" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>';
const ICON_HEART = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
const ICON_OUT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';
const ICON_IN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17"/><path d="M16 17H7V8"/></svg>';

const dayFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatCallTime(timestamp) {
  const date = new Date(timestamp);
  const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  return `${dayFormatter.format(date)}, ${time}`;
}

export function groupCalls(calls) {
  const rows = [];
  for (const call of calls) {
    const last = rows[rows.length - 1];
    if (last && last.call.conversation_id === call.conversation_id
      && last.call.date === call.date
      && last.call.outgoing === call.outgoing
      && last.call.status === call.status) {
      last.count += 1;
      last.oldest = call;
    } else {
      rows.push({ call, count: 1, oldest: call });
    }
  }
  return rows;
}

function describe(call) {
  if (call.status === 'missed') return call.outgoing ? 'Não atendida' : 'Perdida';
  if (call.status === 'no_answer') return 'Sem resposta';
  if (call.duration) return call.duration.includes(':') ? `duração ${call.duration}` : call.duration;
  return '';
}

export function renderCallsPanel({ calls = [], conversations = [], avatarFor = () => null, onOpen = () => {} } = {}) {
  const byId = new Map(conversations.map(conversation => [conversation.id, conversation]));
  const nameOf = id => byId.get(id)?.contact
    || byId.get(id)?.participants?.find(participant => participant !== 'DV')
    || id;

  const panel = document.createElement('section');
  panel.className = 'calls-panel';
  panel.setAttribute('aria-label', 'Chamadas');

  const header = document.createElement('div');
  header.className = 'calls-header';
  const title = document.createElement('h2');
  title.className = 'calls-title';
  title.textContent = 'Chamadas';
  header.appendChild(title);
  for (const [icon, label] of [[ICON_SEARCH, 'Pesquisar chamadas'], [ICON_MEETBALL, 'Menu']]) {
    const button = document.createElement('button');
    button.className = 'calls-header-btn';
    button.disabled = true;
    button.setAttribute('aria-label', label);
    button.innerHTML = icon;
    header.appendChild(button);
  }
  panel.appendChild(header);

  const actions = document.createElement('div');
  actions.className = 'calls-actions';
  for (const [icon, label] of [[ICON_PHONE, 'Ligar'], [ICON_CALENDAR, 'Agendar'], [ICON_KEYPAD, 'Teclado'], [ICON_HEART, 'Favoritos']]) {
    const button = document.createElement('button');
    button.className = 'calls-action';
    button.disabled = true;
    button.setAttribute('aria-label', label);
    button.innerHTML = `<span class="calls-action-icon">${icon}</span><span class="calls-action-label">${label}</span>`;
    actions.appendChild(button);
  }
  panel.appendChild(actions);

  const heading = document.createElement('h3');
  heading.className = 'calls-recent';
  heading.textContent = 'Recentes';
  panel.appendChild(heading);

  const list = document.createElement('div');
  list.className = 'calls-list';
  list.setAttribute('role', 'list');
  for (const { call, count } of groupCalls(calls)) {
    list.appendChild(renderRow(call, count, nameOf(call.conversation_id), avatarFor(call.conversation_id), onOpen));
  }
  panel.appendChild(list);

  const foot = document.createElement('p');
  foot.className = 'calls-foot';
  foot.textContent = `${calls.length} chamadas registradas no material. Tocar numa chamada abre a conversa no ponto em que ela aconteceu.`;
  panel.appendChild(foot);
  return panel;
}

function renderRow(call, count, name, avatar, onOpen) {
  const row = document.createElement('div');
  row.className = `calls-item${call.status === 'missed' && !call.outgoing ? ' missed' : ''}`;
  row.setAttribute('role', 'listitem');
  row.dataset.conversation = call.conversation_id;
  row.dataset.message = call.message_id;
  const open = () => onOpen(call.conversation_id, call.message_id);

  const main = document.createElement('button');
  main.className = 'calls-item-main';
  main.addEventListener('click', open);
  const avatarEl = document.createElement('span');
  avatarEl.className = 'calls-item-avatar';
  if (avatar) {
    const image = document.createElement('img');
    image.src = avatar;
    image.alt = name;
    avatarEl.appendChild(image);
  } else {
    avatarEl.innerHTML = defaultAvatarSvg(name, 48);
  }
  main.appendChild(avatarEl);

  const text = document.createElement('span');
  text.className = 'calls-item-text';
  const nameEl = document.createElement('span');
  nameEl.className = 'calls-item-name';
  nameEl.textContent = count > 1 ? `${name} (${count})` : name;
  text.appendChild(nameEl);

  const meta = document.createElement('span');
  meta.className = 'calls-item-meta';
  const arrow = document.createElement('span');
  arrow.className = 'calls-item-arrow';
  arrow.setAttribute('aria-label', call.outgoing ? 'Chamada feita' : 'Chamada recebida');
  arrow.innerHTML = call.outgoing ? ICON_OUT : ICON_IN;
  meta.appendChild(arrow);
  const when = document.createElement('span');
  const detail = describe(call);
  when.textContent = detail ? `${formatCallTime(call.timestamp)} · ${detail}` : formatCallTime(call.timestamp);
  meta.appendChild(when);
  text.appendChild(meta);
  main.appendChild(text);
  row.appendChild(main);

  const kind = document.createElement('button');
  kind.className = 'calls-item-kind';
  kind.setAttribute('aria-label', call.kind === 'video' ? 'Chamada de vídeo — ver na conversa' : 'Chamada de voz — ver na conversa');
  kind.innerHTML = call.kind === 'video' ? ICON_VIDEO : ICON_PHONE;
  kind.addEventListener('click', open);
  row.appendChild(kind);
  return row;
}
