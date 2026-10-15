import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachContextMenu } from '../../src/components/ContextMenu.js';

describe('message favorites context menu', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('offers add and remove favorite actions from the message menu', () => {
    const chat = document.createElement('div');
    chat.className = 'chat-messages';
    chat.innerHTML = `
      <section class="chat-day" data-date="2025-01-15">
        <div class="chat-msg-row incoming" data-id="42">
          <div class="chat-msg-bubble incoming">
            <div class="chat-msg-content">Mensagem importante</div>
            <span class="chat-msg-meta">12:30</span>
            <button class="chat-msg-chevron" aria-label="Menu da mensagem"></button>
          </div>
        </div>
      </section>`;
    document.body.appendChild(chat);

    let favorited = false;
    const onToggleFavorite = vi.fn(() => { favorited = !favorited; });
    const menu = attachContextMenu(chat, {
      conversationId: 'martha-graeff',
      conversationName: 'Martha Graeff',
      incomingSender: 'Martha Graeff',
      isFavorite: () => favorited,
      onToggleFavorite,
    });

    chat.querySelector('.chat-msg-chevron').click();
    const addButton = [...document.querySelectorAll('.context-menu-item')]
      .find(button => button.textContent.includes('Favoritar mensagem'));
    expect(addButton).toBeDefined();
    addButton.click();
    expect(onToggleFavorite).toHaveBeenCalledWith(expect.objectContaining({
      conversationId: 'martha-graeff',
      messageId: '42',
      conversationName: 'Martha Graeff',
      date: '2025-01-15',
      content: 'Mensagem importante',
    }));

    chat.querySelector('.chat-msg-chevron').click();
    const removeButton = [...document.querySelectorAll('.context-menu-item')]
      .find(button => button.textContent.includes('Remover dos favoritos'));
    expect(removeButton).toBeDefined();
    removeButton.click();
    menu.destroy();
  });
});
