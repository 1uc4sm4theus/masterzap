/** Open the browser's native, fast print flow for the currently visible chat. */
export function printChat(conversationName) {
  if (typeof window.print !== 'function') {
    throw new Error('A impressão não está disponível neste navegador.');
  }

  const previousTitle = document.title;
  const restoreTitle = () => { document.title = previousTitle; };
  document.title = `MasterWhats - ${conversationName || 'conversa'}`;
  window.addEventListener('afterprint', restoreTitle, { once: true });
  try {
    window.print();
  } catch (error) {
    window.removeEventListener('afterprint', restoreTitle);
    restoreTitle();
    throw error;
  }
}
