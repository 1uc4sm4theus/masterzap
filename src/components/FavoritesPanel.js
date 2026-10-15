import { formatDateLong } from '../lib/utils.js';
import { removeFavoriteMessage } from '../lib/favorites.js';

const ICON_STAR = '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>';

function messagePreview(favorite) {
  return favorite.content.trim() || 'Mensagem sem texto';
}

export function renderFavoritesPanel(favorites, { onOpenMessage, onBack } = {}) {
  const panel = document.createElement('section');
  panel.className = 'favorites-panel';
  panel.setAttribute('aria-label', 'Mensagens favoritas');

  const header = document.createElement('header');
  header.className = 'favorites-header';

  const back = document.createElement('button');
  back.className = 'favorites-back';
  back.type = 'button';
  back.setAttribute('aria-label', 'Voltar para conversas');
  back.textContent = '‹';
  back.addEventListener('click', () => onBack?.());
  header.appendChild(back);

  const title = document.createElement('h1');
  title.textContent = 'Mensagens favoritas';
  header.appendChild(title);
  panel.appendChild(header);

  const list = document.createElement('div');
  list.className = 'favorites-list';

  function renderList() {
    list.replaceChildren();
    if (favorites.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'favorites-empty';
      empty.textContent = 'As mensagens que você favoritar aparecerão aqui.';
      list.appendChild(empty);
      return;
    }

    for (const favorite of favorites) {
      const item = document.createElement('article');
      item.className = 'favorite-item';

      const open = document.createElement('button');
      open.className = 'favorite-item-open';
      open.type = 'button';
      open.addEventListener('click', () => {
        onOpenMessage?.(favorite.conversationId, favorite.messageId);
      });

      const conversation = document.createElement('span');
      conversation.className = 'favorite-item-conversation';
      conversation.textContent = favorite.conversationName || favorite.conversationId;
      open.appendChild(conversation);

      const excerpt = document.createElement('span');
      excerpt.className = 'favorite-item-excerpt';
      excerpt.textContent = messagePreview(favorite);
      open.appendChild(excerpt);

      const meta = document.createElement('span');
      meta.className = 'favorite-item-meta';
      meta.textContent = [favorite.sender, formatDateLong(favorite.date), favorite.time]
        .filter(Boolean)
        .join(' · ');
      open.appendChild(meta);
      item.appendChild(open);

      const remove = document.createElement('button');
      remove.className = 'favorite-item-remove';
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Remover dos favoritos');
      remove.title = 'Remover dos favoritos';
      remove.innerHTML = ICON_STAR;
      remove.addEventListener('click', () => {
        if (removeFavoriteMessage(favorites, favorite.conversationId, favorite.messageId)) {
          renderList();
        }
      });
      item.appendChild(remove);
      list.appendChild(item);
    }
  }

  renderList();
  panel.appendChild(list);
  return panel;
}
