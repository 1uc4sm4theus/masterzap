/**
 * ContactInfo — slide-in drawer showing contact details.
 * Triggered by clicking the avatar or contact name in chat header.
 *
 * Matches WhatsApp's "Info do contato" panel.
 *
 * Security note: innerHTML used only with static SVG icon literals.
 * All dynamic text uses textContent.
 */

import { getContactProfile, SOURCES, CREDITS } from '../lib/profile-content.js';
import { renderProfileSections } from './ProfileSections.js';
import { defaultAvatarSvg, defaultGroupAvatarSvg } from '../lib/avatar.js';

const ICON_MEDIA = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
const ICON_STAR = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
const ICON_BELL = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`;
const ICON_CLOCK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`;
const ICON_LOCK = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`;
const ICON_SHIELD = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
import { ICON_SEARCH } from '../lib/icons.js';


/**
 * Show contact info drawer.
 * @param {HTMLElement} mainArea - the .main-area element
 * @param {object} conversation - conversation metadata
 * @param {object} [options]
 * @param {Record<string,number>} [options.mediaCounts] - { images, videos, documents }
 * @param {function} [options.onClose]
 * @returns {{ element: HTMLElement, destroy: function }}
 */
export function showContactInfo(mainArea, conversation, { mediaCounts = {}, onClose, onSearch, actions = {}, avatarForPerson = () => null, focusSource = false } = {}) {
  // Remove existing drawer if any
  const existing = mainArea.querySelector('.contact-info-drawer');
  if (existing) existing.remove();

  const displayName = conversation.contact || conversation.participants[0];
  const contactProfile = getContactProfile(conversation.id);
  const totalMedia = (mediaCounts.images || 0) + (mediaCounts.videos || 0) + (mediaCounts.documents || 0);

  const drawer = document.createElement('div');
  drawer.className = 'contact-info-drawer';

  // Header
  const header = document.createElement('div');
  header.className = 'contact-info-header';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'contact-info-close';
  closeBtn.setAttribute('aria-label', 'Fechar');
  closeBtn.textContent = '✕';
  closeBtn.addEventListener('click', () => {
    destroy();
    if (onClose) onClose();
  });
  header.appendChild(closeBtn);

  const titleEl = document.createElement('span');
  titleEl.className = 'contact-info-title';
  titleEl.textContent = conversation.is_group ? 'Info do grupo' : 'Info do contato';
  header.appendChild(titleEl);

  drawer.appendChild(header);

  // Scrollable body
  const body = document.createElement('div');
  body.className = 'contact-info-body';

  // Avatar + name section
  const profile = document.createElement('div');
  profile.className = 'contact-info-profile';

  const avatarEl = document.createElement('div');
  avatarEl.className = 'contact-info-avatar';
  if (conversation.is_group) {
    avatarEl.innerHTML = defaultGroupAvatarSvg(120);
  } else if (conversation.avatar) {
    const img = document.createElement('img');
    img.src = conversation.avatar;
    img.alt = displayName;
    img.className = 'contact-info-avatar-img';
    avatarEl.appendChild(img);
  } else {
    // Generated SVG — no user data, safe innerHTML
    avatarEl.innerHTML = defaultAvatarSvg(conversation.id, 120);
  }
  profile.appendChild(avatarEl);

  const nameEl = document.createElement('div');
  nameEl.className = 'contact-info-name';
  nameEl.textContent = displayName;
  profile.appendChild(nameEl);

  const phoneEl = document.createElement('div');
  phoneEl.className = 'contact-info-phone';
  phoneEl.textContent = conversation.is_group
    ? conversation.members?.length
      ? `${conversation.members.length} participantes`
      : 'Participantes não identificados'
    : `${conversation.total_messages.toLocaleString('pt-BR')} mensagens`;
  profile.appendChild(phoneEl);

  // Search button
  const searchBtn = document.createElement('div');
  searchBtn.className = 'contact-info-search-btn';
  searchBtn.style.cursor = 'pointer';
  // Static SVG icon — safe innerHTML
  searchBtn.innerHTML = `${ICON_SEARCH} <span>Pesquisar</span>`;
  if (onSearch) searchBtn.addEventListener('click', onSearch);
  profile.appendChild(searchBtn);

  body.appendChild(profile);
  body.appendChild(createDivider());

  if (conversation.is_group) {
    appendGroupInfo(body, conversation, avatarForPerson);
  }

  if (!conversation.is_group && contactProfile?.about) {
    const aboutSection = document.createElement('div');
    aboutSection.className = 'contact-info-section';

    const aboutLabel = document.createElement('div');
    aboutLabel.className = 'contact-info-section-label';
    aboutLabel.textContent = 'Recado';
    aboutSection.appendChild(aboutLabel);

    const aboutValue = document.createElement('div');
    aboutValue.className = 'contact-info-section-value';
    aboutValue.textContent = contactProfile.about;
    aboutSection.appendChild(aboutValue);

    body.appendChild(aboutSection);
    body.appendChild(createDivider());
  }

  if (conversation.related_group) {
    const related = document.createElement('section');
    related.className = 'contact-info-section';
    const label = document.createElement('div');
    label.className = 'contact-info-section-label';
    label.textContent = 'Conversa privada relacionada ao grupo';
    related.appendChild(label);
    const groupLink = document.createElement('a');
    groupLink.className = 'group-info-source';
    groupLink.href = `#/chat/${encodeURIComponent(conversation.related_group.id)}`;
    groupLink.textContent = conversation.related_group.name;
    related.appendChild(groupLink);
    body.appendChild(related);
    body.appendChild(createDivider());
  }

  const sourceSection = createConversationSourceSection(conversation);
  if (sourceSection) {
    body.appendChild(sourceSection);
    body.appendChild(createDivider());
  }

  if (!conversation.is_group) {
    const actionsEl = document.createElement('div');
    actionsEl.className = 'contact-info-actions';

    actionsEl.appendChild(createActionItem(ICON_MEDIA, 'Mídias, links e documentos', totalMedia.toLocaleString('pt-BR'), false, true));
    actionsEl.appendChild(createActionItem(ICON_STAR, 'Mensagens importantes', '', false, true));
    actionsEl.appendChild(createActionItem(ICON_BELL, 'Modo silencioso', '', true, true));
    actionsEl.appendChild(createActionItem(ICON_CLOCK, 'Mensagens temporárias', contactProfile?.ephemeral || 'Não', false, true));
    actionsEl.appendChild(createActionItem(ICON_LOCK, 'Privacidade avançada da conversa', 'Desativada', false, true));
    actionsEl.appendChild(createActionItem(ICON_SHIELD, 'Criptografia', 'As mensagens são protegidas com criptografia de ponta a ponta.', false, true));

    body.appendChild(actionsEl);
    body.appendChild(createDivider());
  }

  if (!conversation.is_group && contactProfile) {
    renderProfileSections(body, contactProfile.sections, SOURCES, CREDITS, actions);
  }

  drawer.appendChild(body);
  mainArea.appendChild(drawer);

  // Trigger open animation and reset scroll
  requestAnimationFrame(() => {
    drawer.classList.add('open');
    body.scrollTop = 0;
    if (focusSource) scrollToSource();
  });

  function scrollToSource() {
    const target = body.querySelector('#contact-info-source')
      || body.querySelector('.profile-sources');
    if (target?.tagName === 'DETAILS') target.open = true;
    target?.scrollIntoView?.({ block: 'start' });
  }

  function destroy() {
    drawer.remove();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      destroy();
      if (onClose) onClose();
    }
  }
  document.addEventListener('keydown', onKeyDown);

  return { element: drawer, destroy, scrollToSource };
}

function createConversationSourceSection(conversation) {
  const detail = conversation.source_detail;
  const sources = conversation.group_sources || [];

  const section = document.createElement('section');
  section.className = 'contact-info-source-section';
  section.id = 'contact-info-source';
  const heading = document.createElement('div');
  heading.className = 'contact-info-section-label';
  heading.textContent = 'Fonte';
  section.appendChild(heading);

  const addText = value => {
    if (!value) return;
    const text = document.createElement('p');
    text.className = 'contact-info-source-value';
    text.textContent = value;
    section.appendChild(text);
  };
  addText(conversation.source || detail?.label || 'Fonte específica não informada nos dados desta conversa.');
  addText(detail?.how);

  const documentSource = conversation.source_document;
  if (documentSource?.url) {
    const link = document.createElement('a');
    link.className = 'group-info-source';
    link.href = documentSource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = documentSource.file || 'Documento de origem';
    section.appendChild(link);
  }

  for (const source of sources) {
    if (!source.url) continue;
    const link = document.createElement('a');
    link.className = 'group-info-source';
    link.href = source.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = source.title || source.url;
    section.appendChild(link);
  }

  return section;
}

function appendGroupInfo(body, conversation, avatarForPerson) {
  const dateRange = conversation.date_range;
  if (dateRange?.start && dateRange?.end) {
    const start = formatGroupDate(dateRange.start);
    const end = formatGroupDate(dateRange.end);
    appendGroupField(body, 'Período', start === end ? start : `${start} – ${end}`);
  }

  if (conversation.group_context) {
    appendGroupField(body, 'Contexto', conversation.group_context);
  }

  if (conversation.group_creator) {
    appendGroupField(body, 'Criador do grupo', conversation.group_creator);
  }

  if (conversation.group_settings) {
    appendGroupField(body, 'Configuração', conversation.group_settings);
  }

  if (conversation.coverage_note) {
    appendGroupField(body, 'Material disponível', conversation.coverage_note);
  }

  const memberSection = document.createElement('section');
  memberSection.className = 'group-info-section';
  const heading = document.createElement('h3');
  heading.className = 'group-info-heading';
  heading.textContent = conversation.members?.length
    ? `Participantes (${conversation.members.length})`
    : 'Participantes não identificados';
  memberSection.appendChild(heading);

  if (conversation.members?.length) {
    const list = document.createElement('ul');
    list.className = 'group-info-members';
    for (const member of conversation.members) {
      const item = document.createElement('li');
      item.className = 'group-info-member';
      const avatar = document.createElement('span');
      avatar.className = 'group-info-member-avatar';
      const src = avatarForPerson(member.name);
      if (src) {
        const img = document.createElement('img');
        img.src = src;
        img.alt = '';
        avatar.appendChild(img);
      } else {
        avatar.innerHTML = defaultAvatarSvg(member.name, 40);
      }
      item.appendChild(avatar);

      const detail = document.createElement('span');
      detail.className = 'group-info-member-detail';
      const name = document.createElement('span');
      name.className = 'group-info-member-name';
      name.textContent = member.name;
      detail.appendChild(name);
      if (member.name === conversation.group_creator) {
        const role = document.createElement('span');
        role.className = 'group-info-member-role';
        role.textContent = 'Criador do grupo';
        detail.appendChild(role);
      }
      item.appendChild(detail);
      list.appendChild(item);
    }
    memberSection.appendChild(list);
  } else {
    const unavailable = document.createElement('p');
    unavailable.className = 'group-info-unavailable';
    unavailable.textContent = 'Os participantes não foram identificados no material disponível.';
    memberSection.appendChild(unavailable);
  }
  body.appendChild(memberSection);

}

function formatGroupDate(value) {
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-').map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  }
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function appendGroupField(body, label, value) {
  const section = document.createElement('section');
  section.className = 'contact-info-section';
  const heading = document.createElement('div');
  heading.className = 'contact-info-section-label';
  heading.textContent = label;
  section.appendChild(heading);
  const content = document.createElement('div');
  content.className = 'contact-info-section-value';
  content.textContent = value;
  section.appendChild(content);
  body.appendChild(section);
}

function createDivider() {
  const div = document.createElement('div');
  div.className = 'contact-info-divider';
  return div;
}

function createActionItem(iconSvg, label, detail, hasToggle = false, disabled = false) {
  const item = document.createElement('div');
  item.className = 'contact-info-action-item';
  if (disabled) item.classList.add('disabled');

  const icon = document.createElement('span');
  icon.className = 'contact-info-action-icon';
  // Static SVG icon — safe innerHTML
  icon.innerHTML = iconSvg;
  item.appendChild(icon);

  const textWrapper = document.createElement('div');
  textWrapper.className = 'contact-info-action-text';

  const labelEl = document.createElement('span');
  labelEl.className = 'contact-info-action-label';
  labelEl.textContent = label;
  textWrapper.appendChild(labelEl);

  if (detail) {
    const detailEl = document.createElement('span');
    detailEl.className = 'contact-info-action-detail';
    detailEl.textContent = detail;
    textWrapper.appendChild(detailEl);
  }

  item.appendChild(textWrapper);

  if (hasToggle) {
    const toggle = document.createElement('div');
    toggle.className = 'contact-info-toggle';
    item.appendChild(toggle);
  }

  return item;
}
