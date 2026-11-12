let activeMenu = null;
let nextToken = 1;

function isMenuHistoryState(token) {
  return window.history.state?.masterWhatsMenuToken === token;
}

function dismiss(entry, fromPopState = false, keepHistoryEntry = false) {
  if (activeMenu !== entry) return;
  activeMenu = null;
  document.removeEventListener('pointerdown', entry.onOutsidePointer, true);
  document.removeEventListener('keydown', entry.onKeyDown, true);
  window.removeEventListener('popstate', entry.onPopState);
  const shouldGoBack = !fromPopState && !keepHistoryEntry
    && isMenuHistoryState(entry.token);
  entry.onClose();
  if (shouldGoBack) window.history.back();
}

/** Register the one transient menu allowed to be open across the app. */
export function registerOpenMenu(element, onClose) {
  const previous = activeMenu;
  if (previous) dismiss(previous, false, true);

  const token = nextToken++;
  const entry = {
    token,
    element,
    onClose,
    onOutsidePointer(event) {
      if (!element.contains(event.target)) {
        setTimeout(() => dismiss(entry), 0);
      }
    },
    onKeyDown(event) {
      if (event.key === 'Escape') dismiss(entry);
    },
    onPopState() {
      dismiss(entry, true);
    },
  };

  const previousState = window.history.state;
  const oldToken = previous?.token;
  const replaceExistingEntry = oldToken != null
    && previousState?.masterWhatsMenuToken === oldToken;
  const state = { ...(previousState || {}), masterWhatsMenuToken: token };
  if (replaceExistingEntry) window.history.replaceState(state, '');
  else window.history.pushState(state, '');

  activeMenu = entry;
  document.addEventListener('pointerdown', entry.onOutsidePointer, true);
  document.addEventListener('keydown', entry.onKeyDown, true);
  window.addEventListener('popstate', entry.onPopState);
  return () => dismiss(entry);
}
