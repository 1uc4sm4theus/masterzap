/**
 * The Calls screen: every call Vorcaro made or received that the material
 * records, newest first, the way WhatsApp lists them.
 *
 * Security note: names come from the data and go in as textContent; the only
 * innerHTML is static SVG stored in plain quoted strings.
 */

import { defaultAvatarSvg } from '../lib/avatar.js';
import { ICON_SEARCH, ICON_MEETBALL } from '../lib/icons.js';

var ICON_PHONE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
var ICON_VIDEO = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2"/></svg>';
var ICON_CALENDAR = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
var ICON_KEYPAD = '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><circle cx="6" cy="5" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="18" cy="12" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="12" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>';
var ICON_HEART = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
var ICON_OUT = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17 17 7"/><path d="M8 7h9v9"/></svg>';
var ICON_IN = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7 7 17"/><path d="M16 17H7V8"/></svg>';

var dayFmt = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' });

export function formatCallTime(timestamp) {
  var d = new Date(timestamp);
  var hh = String(d.getHours()).padStart(2, '0');
  var mm = String(d.getMinutes()).padStart(2, '0');
  return dayFmt.format(d) + ', ' + hh + ':' + mm;
}

export function groupCalls(calls) {
  var rows = [];
  for (var i = 0; i < calls.length; i++) {
    var call = calls[i];
    var last = rows.length ? rows[rows.length - 1] : null;
    if (
      last &&
      last.call.conversation_id === call.conversation_id &&
      last.call.date === call.date &&
      last.call.outgoing === call.outgoing &&
      last.call.status === call.status
    ) {
      last.count += 1;
      last.oldest = call;
    } else {
      rows.push({ call: call, count: 1, oldest: call });
    }
  }
  return rows;
}

function describe(call) {
  var parts = [];
  if (call.status === 'missed') parts.push(call.outgoing ? 'Não atendida' : 'Perdida');
  else if (call.status === 'no_answer') parts.push('Sem resposta');
  else if (call.duration) {
    parts.push(call.duration.indexOf(':') !== -1 ? 'duração ' + call.duration : call.duration);
  }
  return parts.join(' · ');
}

export function renderCallsPanel(opts) {
  var calls = opts.calls;
  var conversations = opts.conversations;
  var avatarFor = opts.avatarFor;
  var onOpen = opts.onOpen;

  var byId = new Map();
  for (var i = 0; i < conversations.length; i++) {
    byId.set(conversations[i].id, conversations[i]);
  }

  function nameOf(id) {
    var c = byId.get(id);
    if (!c) return id;
    if (c.contact) return c.contact;
    if (c.participants) {
      for (var p = 0; p < c.participants.length; p++) {
        if (c.participants[p] !== 'DV') return c.participants[p];
      }
    }
    return id;
  }

  var panel = document.createElement('section');
  panel.className = 'calls-panel';
  panel.setAttribute('aria-label', 'Chamadas');

  var header = document.createElement('div');
  header.className = 'calls-header';
  var title = document.createElement('h2');
  title.className = 'calls-title';
  title.textContent = 'Chamadas';
  header.appendChild(title);

  var headerBtns = [
    { icon: ICON_SEARCH, label: 'Pesquisar chamadas' },
    { icon: ICON_MEETBALL, label: 'Menu' }
  ];
  for (var h = 0; h < headerBtns.length; h++) {
    var hb = document.createElement('button');
    hb.className = 'calls-header-btn';
    hb.disabled = true;
    hb.setAttribute('aria-label', headerBtns[h].label);
    hb.innerHTML = headerBtns[h].icon;
    header.appendChild(hb);
  }
  panel.appendChild(header);

  var actions = document.createElement('div');
  actions.className = 'calls-actions';
  var actionBtns = [
    { icon: ICON_PHONE, label: 'Ligar' },
    { icon: ICON_CALENDAR, label: 'Agendar' },
    { icon: ICON_KEYPAD, label: 'Teclado' },
    { icon: ICON_HEART, label: 'Favoritos' }
  ];
  for (var a = 0; a < actionBtns.length; a++) {
    var ab = document.createElement('button');
    ab.className = 'calls-action';
    ab.disabled = true;
    ab.setAttribute('aria-label', actionBtns[a].label);
    var iconWrap = document.createElement('span');
    iconWrap.className = 'calls-action-icon';
    iconWrap.innerHTML = actionBtns[a].icon;
    var lab = document.createElement('span');
    lab.className = 'calls-action-label';
    lab.textContent = actionBtns[a].label;
    ab.appendChild(iconWrap);
    ab.appendChild(lab);
    actions.appendChild(ab);
  }
  panel.appendChild(actions);

  var heading = document.createElement('h3');
  heading.className = 'calls-recent';
  heading.textContent = 'Recentes';
  panel.appendChild(heading);

  var list = document.createElement('div');
  list.className = 'calls-list';
  list.setAttribute('role', 'list');
  var grouped = groupCalls(calls);
  for (var g = 0; g < grouped.length; g++) {
    list.appendChild(
      renderRow(
        grouped[g].call,
        grouped[g].count,
        nameOf(grouped[g].call.conversation_id),
        avatarFor(grouped[g].call.conversation_id),
        onOpen
      )
    );
  }
  panel.appendChild(list);

  var foot = document.createElement('p');
  foot.className = 'calls-foot';
  foot.textContent =
    calls.length +
    ' chamadas registradas no material. Tocar numa chamada abre a conversa no ponto em que ela aconteceu.';
  panel.appendChild(foot);

  return panel;
}

function renderRow(call, count, name, avatar, onOpen) {
  var row = document.createElement('div');
  row.className = call.status === 'missed' && !call.outgoing ? 'calls-item missed' : 'calls-item';
  row.setAttribute('role', 'listitem');
  row.dataset.conversation = call.conversation_id;
  row.dataset.message = call.message_id;

  function open() {
    onOpen(call.conversation_id, call.message_id);
  }

  var main = document.createElement('button');
  main.className = 'calls-item-main';
  main.addEventListener('click', open);

  var av = document.createElement('span');
  av.className = 'calls-item-avatar';
  if (avatar) {
    var img = document.createElement('img');
    img.src = avatar;
    img.alt = name;
    av.appendChild(img);
  } else {
    av.innerHTML = defaultAvatarSvg(name, 48);
  }
  main.appendChild(av);

  var text = document.createElement('span');
  text.className = 'calls-item-text';

  var who = document.createElement('span');
  who.className = 'calls-item-name';
  who.textContent = count > 1 ? name + ' (' + count + ')' : name;
  text.appendChild(who);

  var meta = document.createElement('span');
  meta.className = 'calls-item-meta';

  var arrow = document.createElement('span');
  arrow.className = call.outgoing ? 'calls-item-arrow out' : 'calls-item-arrow in';
  arrow.setAttribute('aria-label', call.outgoing ? 'Chamada feita' : 'Chamada recebida');
  arrow.innerHTML = call.outgoing ? ICON_OUT : ICON_IN;
  meta.appendChild(arrow);

  var when = document.createElement('span');
  var detail = describe(call);
  var whenText = formatCallTime(call.timestamp);
  when.textContent = detail ? whenText + ' · ' + detail : whenText;
  meta.appendChild(when);

  text.appendChild(meta);
  main.appendChild(text);
  row.appendChild(main);

  var kind = document.createElement('button');
  kind.className = 'calls-item-kind';
  kind.setAttribute(
    'aria-label',
    call.kind === 'video' ? 'Chamada de vídeo — ver na conversa' : 'Chamada de voz — ver na conversa'
  );
  kind.innerHTML = call.kind === 'video' ? ICON_VIDEO : ICON_PHONE;
  kind.addEventListener('click', open);
  row.appendChild(kind);

  return row;
}
