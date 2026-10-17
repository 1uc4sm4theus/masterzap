export const MAX_PINNED_CONVERSATIONS = 3;

const STORAGE_PREFIX = 'masterwhats:pinned-conversations:';

function storageKey(profileId) {
  return `${STORAGE_PREFIX}${profileId}`;
}

function persistPinnedConversations(profileId, pinnedConversations) {
  try {
    localStorage.setItem(storageKey(profileId), JSON.stringify([...pinnedConversations]));
  } catch {
    // Keep the pinned state available in memory for this session.
  }
}

/** @returns {Set<string>} pinned conversation IDs for this profile */
export function loadPinnedConversations(profileId) {
  try {
    const raw = localStorage.getItem(storageKey(profileId));
    if (!raw) return new Set();

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    const validIds = [...new Set(parsed.filter(id => typeof id === 'string' && id.length > 0))];
    return new Set(validIds.slice(0, MAX_PINNED_CONVERSATIONS));
  } catch {
    return new Set();
  }
}

/**
 * Toggle a conversation's pinned state.
 * @returns {'pinned'|'unpinned'|'limit'} outcome
 */
export function togglePinnedConversation(pinnedConversations, conversationId, profileId) {
  if (!conversationId) return 'limit';

  if (pinnedConversations.has(conversationId)) {
    pinnedConversations.delete(conversationId);
    persistPinnedConversations(profileId, pinnedConversations);
    return 'unpinned';
  }

  if (pinnedConversations.size >= MAX_PINNED_CONVERSATIONS) return 'limit';

  pinnedConversations.add(conversationId);
  persistPinnedConversations(profileId, pinnedConversations);
  return 'pinned';
}
