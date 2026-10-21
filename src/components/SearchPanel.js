/**
 * SearchPanel — renders matching conversations first, followed by matching messages.
 */
import { escapeHtml, formatDateShort } from '../lib/utils.js';
import { defaultAvatarSvg } from '../lib/avatar.js';
import { countSearchIndex, loadSearchIndex, normalize, searchIndex } from '../lib/search.js';

const DEBOUNCE_MS = 200;
const MESSAGE_RESULT_LIMIT = 50;

/**
 * Attach search behavior to the sidebar.
 * @param {HTMLElement} sidebar
 * @param {Array} conversations
 * @param {object} callbacks
 * @param {function} callbacks.onResultClick - (conversationId, messageId, date) => void
 * @param {function} callbacks.onConversationClick - (conversationId) => void
 * @returns {{ destroy: function }}
 */
export function attachSearch(sidebar, conversations, { onResultClick, onConversationClick }) {
  const input = sidebar.querySelector('.sidebar-search-input');
  const listContainer = sidebar.querySelector('.conversation-list');

  let resultsEl = null;
  let debounceTimer = null;
  let lastQuery = '';
  let searchVersion = 0;

  function ensureResults() {
    if (resultsEl) return resultsEl;

    resultsEl = document.createElement('div');
    resultsEl.className = 'search-results';
    resultsEl.setAttribute('role', 'region');
    resultsEl.setAttribute('aria-label', 'Resultados da pesquisa');
    listContainer.style.display = 'none';
    listContainer.parentNode.insertBefore(resultsEl, listContainer.nextSibling);
    return resultsEl;
  }

  function renderResults(conversationMatches, messageResults, {
    loading = false,
    failedCount = 0,
    messageCount = null,
  } = {}) {
    const container = ensureResults();
    container.replaceChildren();

    if (conversationMatches.length > 0) {
      const section = createSection('Conversas');
      for (const conversation of conversationMatches) {
        section.appendChild(createConversationResult(conversation));
      }
      container.appendChild(section);
    }

    if (messageResults.length > 0 || loading || messageCount > 0) {
      const countLabel = messageCount === null
        ? null
        : `${messageCount} resultado${messageCount === 1 ? '' : 's'} encontrado${messageCount === 1 ? '' : 's'}`;
      const section = createSection('Mensagens', countLabel);
      for (const result of messageResults) {
        section.appendChild(createMessageResult(result));
      }
      if (loading) {
        const status = document.createElement('div');
        status.className = 'search-status';
        status.textContent = 'Pesquisando mensagens...';
        section.appendChild(status);
      }
      if (!loading && messageCount > messageResults.length) {
        const status = document.createElement('div');
        status.className = 'search-status';
        status.textContent = `Exibindo os ${messageResults.length} mais recentes.`;
        section.appendChild(status);
      }
      container.appendChild(section);
    }

    if (failedCount > 0) {
      const status = document.createElement('div');
      status.className = 'search-status search-status--error';
      status.textContent = `Não foi possível pesquisar em ${failedCount} conversa${failedCount === 1 ? '' : 's'}.`;
      container.appendChild(status);
    }

    if (!loading && conversationMatches.length === 0 && messageResults.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'search-empty';
      empty.textContent = 'Nenhuma mensagem encontrada';
      container.appendChild(empty);
    }
  }

  function createSection(title, countLabel = null) {
    const section = document.createElement('section');
    section.className = 'search-results-section';

    const heading = document.createElement('h2');
    heading.className = 'search-results-heading';
    heading.textContent = title;
    if (countLabel) {
      const count = document.createElement('span');
      count.className = 'search-results-count';
      count.textContent = countLabel;
      heading.appendChild(count);
    }
    section.appendChild(heading);
    return section;
  }

  function createConversationResult(conversation) {
    const item = document.createElement('div');
    item.className = 'search-conversation-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    const avatar = document.createElement('div');
    avatar.className = 'search-conversation-avatar';
    if (conversation.avatar) {
      const image = document.createElement('img');
      image.src = conversation.avatar;
      image.alt = '';
      avatar.appendChild(image);
    } else {
      avatar.innerHTML = defaultAvatarSvg(conversation.id);
    }

    const content = document.createElement('div');
    content.className = 'search-conversation-content';

    const name = document.createElement('div');
    name.className = 'search-conversation-name';
    name.innerHTML = highlightMatch(conversation.displayName, conversation.matchStart, conversation.matchEnd);
    content.appendChild(name);

    const preview = conversation.last_message?.content || '';
    if (preview) {
      const previewEl = document.createElement('div');
      previewEl.className = 'search-conversation-preview';
      previewEl.textContent = preview;
      content.appendChild(previewEl);
    }

    item.append(avatar, content);
    item.addEventListener('click', () => onConversationClick(conversation.id));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onConversationClick(conversation.id);
      }
    });
    return item;
  }

  function createMessageResult(result) {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');

    const contactEl = document.createElement('span');
    contactEl.className = 'search-result-sender';
    contactEl.textContent = result.contact;

    const dateEl = document.createElement('span');
    dateEl.className = 'search-result-date';
    dateEl.textContent = formatDateShort(result.date);

    const topRow = document.createElement('div');
    topRow.className = 'search-result-top';
    topRow.append(contactEl, dateEl);

    const contentEl = document.createElement('div');
    contentEl.className = 'search-result-content';
    contentEl.innerHTML = highlightMatch(result.content, result.matchStart, result.matchEnd);

    item.append(topRow, contentEl);
    const openResult = () => onResultClick(result.conversationId, result.id, result.date);
    item.addEventListener('click', openResult);
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openResult();
      }
    });
    return item;
  }

  function highlightMatch(content, start, end) {
    const before = escapeHtml(content.slice(0, start));
    const match = escapeHtml(content.slice(start, end));
    const after = escapeHtml(content.slice(end));
    return `${before}<mark class="search-highlight">${match}</mark>${after}`;
  }

  function findConversationMatches(query) {
    const normalizedQuery = normalize(query);
    const matches = [];

    for (const conversation of conversations) {
      const displayName = conversation.contact
        || conversation.participants?.find(name => name !== (conversation.owner || 'DV'))
        || conversation.id;
      const normalizedName = normalize(displayName);
      const matchStart = normalizedName.indexOf(normalizedQuery);
      if (matchStart === -1) continue;

      matches.push({
        ...conversation,
        displayName,
        matchStart,
        matchEnd: matchStart + query.length,
        matchRank: matchStart === 0
          ? (normalizedName.length === normalizedQuery.length ? 0 : 1)
          : 2,
      });
    }

    return matches.sort((a, b) => a.matchRank - b.matchRank
      || a.displayName.localeCompare(b.displayName, 'pt-BR'));
  }

  async function onInput(version) {
    const query = input.value.trim();
    if (query.length < 2) {
      hideResults();
      lastQuery = '';
      return;
    }

    if (query === lastQuery) return;
    lastQuery = query;

    const conversationMatches = findConversationMatches(query);
    renderResults(conversationMatches, [], { loading: true });

    const loadedIndexes = await Promise.allSettled(
      conversations.map(conversation => loadSearchIndex(conversation.id))
    );
    if (version !== searchVersion || input.value.trim() !== query) return;

    const messageResults = [];
    let messageCount = 0;
    let failedCount = 0;
    loadedIndexes.forEach((result, index) => {
      if (result.status === 'rejected') {
        failedCount++;
        console.error(`Failed to load search index for ${conversations[index].id}:`, result.reason);
        return;
      }
      const conversation = conversations[index];
      const contact = conversation.contact
        || conversation.participants?.find(name => name !== (conversation.owner || 'DV'))
        || conversation.id;
      messageCount += countSearchIndex(result.value, query);
      const hits = searchIndex(result.value, query, {
        limit: MESSAGE_RESULT_LIMIT,
        newestFirst: true,
      });
      for (const hit of hits) {
        messageResults.push({ ...hit, conversationId: conversation.id, contact });
      }
    });

    const conversationOrder = new Map(conversations.map((conversation, index) => [conversation.id, index]));
    messageResults.sort((a, b) => b.date.localeCompare(a.date)
      || conversationOrder.get(a.conversationId) - conversationOrder.get(b.conversationId)
      || Number(b.id) - Number(a.id));
    renderResults(conversationMatches, messageResults.slice(0, MESSAGE_RESULT_LIMIT), {
      failedCount,
      messageCount,
    });
  }

  function hideResults() {
    if (resultsEl) {
      resultsEl.remove();
      resultsEl = null;
    }
    listContainer.style.display = '';
  }

  function onInputDebounced() {
    clearTimeout(debounceTimer);
    if (input.value.trim() === lastQuery && resultsEl) return;
    const version = ++searchVersion;
    debounceTimer = setTimeout(() => onInput(version), DEBOUNCE_MS);
  }

  function onKeyDown(event) {
    if (event.key === 'Escape') {
      searchVersion++;
      input.value = '';
      hideResults();
      input.blur();
    }
  }

  input.addEventListener('input', onInputDebounced);
  input.addEventListener('keydown', onKeyDown);

  return {
    destroy() {
      searchVersion++;
      clearTimeout(debounceTimer);
      hideResults();
      input.removeEventListener('input', onInputDebounced);
      input.removeEventListener('keydown', onKeyDown);
    },
  };
}
