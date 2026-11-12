const STORAGE_KEY = 'masterwhats:chat-scroll-positions';
const MAX_POSITIONS = 80;

function readPositions() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
  } catch {
    return {};
  }
}

/** Save a real visible-message anchor without persisting an initial/top position. */
export function saveChatScrollPosition(conversationId, position) {
  if (!conversationId || !position || position.messageId == null || !position.date
      || !Number.isFinite(position.offset) || position.scrollTop <= 0) return false;

  const positions = readPositions();
  delete positions[conversationId];
  positions[conversationId] = {
    messageId: String(position.messageId),
    date: position.date,
    offset: position.offset,
    savedAt: Date.now(),
  };

  const recent = Object.entries(positions).slice(-MAX_POSITIONS);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(recent)));
    return true;
  } catch {
    return false;
  }
}

/** Read the last saved message anchor for a conversation. */
export function loadChatScrollPosition(conversationId) {
  if (!conversationId) return null;
  const position = readPositions()[conversationId];
  if (!position || typeof position.messageId !== 'string'
      || typeof position.date !== 'string' || !Number.isFinite(position.offset)) return null;
  return position;
}

/** Clear positions between tests or when a user explicitly resets local data. */
export function clearChatScrollPositions() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage may be disabled; there is nothing else to clear.
  }
}
