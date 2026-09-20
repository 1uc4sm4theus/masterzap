const ICON_CLOSE = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m18 6-12 12M6 6l12 12"/></svg>';
const ICON_PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="m8 5 11 7-11 7V5Z"/></svg>';

const labels = { image: 'Mídias', video: 'Mídias', document: 'Documentos', link: 'Links' };
const tabs = [
  { id: 'media', label: 'Mídias', kinds: ['image', 'video'] },
  { id: 'document', label: 'Documentos', kinds: ['document'] },
  { id: 'link', label: 'Links', kinds: ['link'] },
];

const dateFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

function dateLabel(item) {
  const value = item.date || item.timestamp?.slice(0, 10);
  if (!value) return 'Sem data';
  return dateFormatter.format(new Date(`${value}T12:00:00`));
}

function mediaUrl(item) {
  return item.path ? `/media/${item.path.replace(/^\/+/, '')}` : '';
}

function renderPreview(item) {
  const frame = document.createElement('div');
  frame.className = `media-tile-preview media-tile-${item.type}`;
  const url = mediaUrl(item);

  if (url && item.type === 'image') {
    const image = document.createElement('img');
    image.src = url;
    image.alt = item.caption || 'Foto compartilhada';
    image.loading = 'lazy';
    frame.appendChild(image);
  } else if (url && item.type === 'video') {
    const video = document.createElement('video');
    video.src = url;
    video.preload = 'metadata';
    video.muted = true;
    frame.appendChild(video);
    const play = document.createElement('span');
    play.className = 'media-tile-play';
    play.innerHTML = ICON_PLAY;
    frame.appendChild(play);
  } else {
    const status = document.createElement('span');
    status.className = 'media-tile-unavailable';
    status.textContent = item.path ? 'Arquivo indisponível' : (item.type === 'link' ? 'Link compartilhado' : 'Mídia sem arquivo');
    frame.appendChild(status);
  }
  return frame;
}

function renderViewer(container, items, index, onOpenMessage) {
  let current = index;
  const overlay = document.createElement('div');
  overlay.className = 'media-viewer';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-label', 'Visualizador de mídia');
  overlay.innerHTML = `
    <div class="media-viewer-bar">
      <button class="media-viewer-close" aria-label="Fechar">${ICON_CLOSE}</button>
      <span class="media-viewer-title"></span>
      <span class="media-viewer-count"></span>
    </div>
    <div class="media-viewer-stage">
      <button class="media-viewer-nav media-viewer-prev" aria-label="Mídia anterior">‹</button>
      <div class="media-viewer-content"></div>
      <button class="media-viewer-nav media-viewer-next" aria-label="Próxima mídia">›</button>
    </div>
    <div class="media-viewer-footer">
      <span class="media-viewer-caption"></span>
      <button class="media-viewer-message" type="button">Abrir mensagem</button>
    </div>`;

  const content = overlay.querySelector('.media-viewer-content');
  const title = overlay.querySelector('.media-viewer-title');
  const count = overlay.querySelector('.media-viewer-count');
  const caption = overlay.querySelector('.media-viewer-caption');
  const openMessage = overlay.querySelector('.media-viewer-message');

  function update() {
    const item = items[current];
    content.replaceChildren(renderPreview(item));
    title.textContent = item.conversation_name || labels[item.type] || 'Mídia';
    count.textContent = `${current + 1} de ${items.length}`;
    caption.textContent = item.caption || dateLabel(item);
    const canOpen = item.conversation_id && item.message_id;
    openMessage.hidden = !canOpen;
    if (canOpen) openMessage.onclick = () => onOpenMessage(item.conversation_id, item.message_id);
  }

  const close = () => {
    document.removeEventListener('keydown', overlay._onKeydown);
    overlay.remove();
  };
  overlay.querySelector('.media-viewer-close').onclick = close;
  overlay.querySelector('.media-viewer-prev').onclick = () => { current = (current - 1 + items.length) % items.length; update(); };
  overlay.querySelector('.media-viewer-next').onclick = () => { current = (current + 1) % items.length; update(); };
  overlay.onclick = (event) => { if (event.target === overlay) close(); };
  overlay._onKeydown = (event) => {
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') overlay.querySelector('.media-viewer-prev').click();
    if (event.key === 'ArrowRight') overlay.querySelector('.media-viewer-next').click();
  };
  document.addEventListener('keydown', overlay._onKeydown);
  update();
  container.appendChild(overlay);
  return overlay;
}

export function renderMediaPanel({ items = [], onOpenMessage = () => {} } = {}) {
  const panel = document.createElement('section');
  panel.className = 'media-panel';
  panel.setAttribute('aria-label', 'Mídias');

  const header = document.createElement('header');
  header.className = 'media-panel-header';
  header.innerHTML = '<div><h1>Mídia</h1><p>Mídias de todas as conversas</p></div>';
  panel.appendChild(header);

  const tabBar = document.createElement('nav');
  tabBar.className = 'media-tabs';
  tabBar.setAttribute('role', 'tablist');
  const content = document.createElement('div');
  content.className = 'media-panel-content';
  let activeTab = 'media';

  function renderTab() {
    content.replaceChildren();
    const tab = tabs.find(entry => entry.id === activeTab);
    const visible = items.filter(item => tab.kinds.includes(item.type));
    if (!visible.length) {
      const empty = document.createElement('p');
      empty.className = 'media-empty';
      empty.textContent = 'Nenhum conteúdo disponível nesta seção.';
      content.appendChild(empty);
      return;
    }
    const grouped = new Map();
    for (const item of visible) {
      const key = item.date || item.timestamp?.slice(0, 10) || 'unknown';
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(item);
    }
    for (const group of grouped.values()) {
      const heading = document.createElement('h2');
      heading.className = 'media-date-heading';
      heading.textContent = dateLabel(group[0]);
      content.appendChild(heading);
      const grid = document.createElement('div');
      grid.className = 'media-grid';
      group.forEach((item) => {
        const tile = document.createElement('button');
        tile.className = 'media-tile';
        tile.type = 'button';
        tile.setAttribute('aria-label', item.caption || `${labels[item.type] || 'Mídia'} de ${dateLabel(item)}`);
        tile.appendChild(renderPreview(item));
        if (item.caption) {
          const captionEl = document.createElement('span');
          captionEl.className = 'media-tile-caption';
          captionEl.textContent = item.caption;
          tile.appendChild(captionEl);
        }
        tile.onclick = () => renderViewer(panel, visible, visible.indexOf(item), onOpenMessage);
        grid.appendChild(tile);
      });
      content.appendChild(grid);
    }
  }

  for (const tab of tabs) {
    const button = document.createElement('button');
    button.className = 'media-tab';
    button.type = 'button';
    button.setAttribute('role', 'tab');
    button.textContent = tab.label;
    button.dataset.tab = tab.id;
    button.onclick = () => {
      activeTab = tab.id;
      tabBar.querySelectorAll('.media-tab').forEach(el => el.classList.toggle('active', el === button));
      renderTab();
    };
    tabBar.appendChild(button);
  }
  tabBar.querySelector('.media-tab').classList.add('active');
  panel.appendChild(tabBar);
  panel.appendChild(content);
  renderTab();
  return panel;
}