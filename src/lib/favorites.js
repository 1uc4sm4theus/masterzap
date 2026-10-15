const STORAGE_KEY = 'masterwhats:favorite-messages';

function isFavoriteMessage(value) {
  return value
    && typeof value.conversationId === 'string'
    && value.conversationId.length > 0
    && (typeof value.messageId === 'string' || typeof value.messageId === 'number')
    && typeof value.date === 'string'
    && typeof value.content === 'string';
}

function favoriteKey(favorite) {
  return `${favorite.conversationId}/${favorite.messageId}`;
}

function persistFavorites(favorites) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch {
    // Keep the favorites available in memory for this session.
  }
}

/** @returns {Array<object>} favorite messages saved in this browser */
export function loadFavoriteMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isFavoriteMessage);
  } catch {
    return [];
  }
}

/** Check whether a message is in the current favorites list. */
export function isFavoriteMessageSaved(favorites, conversationId, messageId) {
  const key = favoriteKey({ conversationId, messageId });
  return favorites.some(favorite => favoriteKey(favorite) === key);
}

/**
 * Toggle a message in the mutable favorites list and persist it.
 * @returns {boolean} true when the message is now a favorite
 */
export function toggleFavoriteMessage(favorites, message) {
  const key = favoriteKey(message);
  const index = favorites.findIndex(favorite => favoriteKey(favorite) === key);

  if (index >= 0) {
    favorites.splice(index, 1);
    persistFavorites(favorites);
    return false;
  }

  const favorite = {
    conversationId: message.conversationId,
    messageId: String(message.messageId),
    conversationName: message.conversationName || message.conversationId,
    date: message.date,
    time: message.time || '',
    sender: message.sender || '',
    content: message.content || '',
    savedAt: new Date().toISOString(),
  };
  if (!isFavoriteMessage(favorite)) return false;

  favorites.unshift(favorite);
  persistFavorites(favorites);
  return true;
}

/** Remove a message from the mutable favorites list and persist it. */
export function removeFavoriteMessage(favorites, conversationId, messageId) {
  const key = favoriteKey({ conversationId, messageId });
  const index = favorites.findIndex(favorite => favoriteKey(favorite) === key);
  if (index < 0) return false;

  favorites.splice(index, 1);
  persistFavorites(favorites);
  return true;
}
