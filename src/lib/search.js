/**
 * Search module — loads the search index and provides fast text search.
 *
 * The search index is a pre-built array of { id, date, sender, content }
 * with content truncated to 80 chars. We do case-insensitive substring matching
 * and normalize accents for broader matching.
 */

const _indexes = new Map();
const _pendingIndexes = new Map();
let _activeIndexId = null;

/**
 * Load the search index for a conversation.
 *
 * Indexes are cached per conversation so searches can load several chats
 * concurrently without replacing the active chat's index.
 *
 * @param {string} conversationId
 * @param {string} [basePath='/data']
 * @returns {Promise<Array>}
 */
export async function loadSearchIndex(conversationId, basePath = '/data') {
  _activeIndexId = conversationId;
  if (_indexes.has(conversationId)) return _indexes.get(conversationId);
  if (_pendingIndexes.has(conversationId)) return _pendingIndexes.get(conversationId);

  const promise = fetch(`${basePath}/${conversationId}/search-index.json`)
    .then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(data => {
      _indexes.set(conversationId, data);
      return data;
    })
    .finally(() => {
      if (_pendingIndexes.get(conversationId) === promise) {
        _pendingIndexes.delete(conversationId);
      }
    });

  _pendingIndexes.set(conversationId, promise);
  return promise;
}

/**
 * Normalize a string for search: lowercase + strip accents.
 * @param {string} str
 * @returns {string}
 */
export function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** How much context to keep on each side of a match in a long message. */
const EXCERPT_LEAD = 32;
const EXCERPT_LENGTH = 110;

/**
 * Trim long content down to a window around the match.
 *
 * Result rows are a single ellipsized line, so a match 300 characters into a
 * message would be scrolled off the right edge and invisible. Recentre the text
 * on the match and shift the offsets to suit. Short content is returned as-is.
 *
 * @returns {{content: string, matchStart: number, matchEnd: number}}
 */
function excerptAround(content, matchStart, matchEnd) {
  if (content.length <= EXCERPT_LENGTH) {
    return { content, matchStart, matchEnd };
  }

  let start = Math.max(0, matchStart - EXCERPT_LEAD);
  let end = Math.min(content.length, start + EXCERPT_LENGTH);
  // Near the end of the message, slide the window back so it stays full width.
  start = Math.max(0, Math.min(start, end - EXCERPT_LENGTH));

  const prefix = start > 0 ? '…' : '';
  const suffix = end < content.length ? '…' : '';
  const offset = prefix.length - start;

  return {
    content: prefix + content.slice(start, end) + suffix,
    matchStart: matchStart + offset,
    matchEnd: matchEnd + offset,
  };
}

/**
 * Search the index for a query string.
 * @param {string} query - search query
 * @param {object} [options]
 * @param {number} [options.limit=50] - max results to return
 * @param {string} [options.sender] - filter by sender name
 * @param {boolean} [options.newestFirst=false] - scan from newest index entry
 * @returns {Array<{ id, date, sender, content, matchStart, matchEnd }>}
 */
export function search(query, options = {}) {
  return searchIndex(_indexes.get(_activeIndexId), query, options);
}

/**
 * Search a specific conversation index without changing the active chat index.
 * @param {Array} index
 * @param {string} query
 * @param {object} [options]
 * @param {number} [options.limit=50]
 * @param {string} [options.sender]
 * @param {boolean} [options.newestFirst=false]
 * @returns {Array<{ id, date, sender, content, matchStart, matchEnd }>}
 */
export function searchIndex(index, query, { limit = 50, sender, newestFirst = false } = {}) {
  if (!index || !query || query.length < 2) return [];

  const normalizedQuery = normalize(query);
  const results = [];

  const start = newestFirst ? index.length - 1 : 0;
  const end = newestFirst ? -1 : index.length;
  const step = newestFirst ? -1 : 1;
  for (let i = start; i !== end; i += step) {
    const entry = index[i];
    if (sender && entry.sender !== sender) continue;

    const normalizedContent = normalize(entry.content);
    const matchStart = normalizedContent.indexOf(normalizedQuery);

    if (matchStart !== -1) {
      results.push({
        ...entry,
        ...excerptAround(entry.content, matchStart, matchStart + query.length),
      });

      if (results.length >= limit) break;
    }
  }

  return results;
}

/** Clear loaded indexes (for testing). */
export function resetSearchIndex() {
  _indexes.clear();
  _pendingIndexes.clear();
  _activeIndexId = null;
}

/**
 * Check if an index is loaded — for a specific conversation when given one.
 * @param {string} [conversationId]
 */
export function isIndexLoaded(conversationId) {
  if (conversationId !== undefined) return _indexes.has(conversationId);
  return _indexes.size > 0;
}
