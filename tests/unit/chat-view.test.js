// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest';
import { renderChatView, renderMessage } from '../../src/components/ChatView.js';

describe('chat print action', () => {
  it('offers the native print action without preparing a screenshot', () => {
    const container = document.createElement('div');
    const onPrint = vi.fn();
    renderChatView(container, {
      conversation: {
        id: 'martha-graeff',
        contact: 'Martha Graeff',
        participants: ['Martha Graeff', 'DV'],
        total_messages: 65772,
      },
      dateIndex: [],
      loadMessages: async () => [],
      onPrint,
    });

    container.querySelector('.chat-header-menu-btn[aria-label="Menu"]').click();
    const printItem = [...container.querySelectorAll('.chat-dropdown-item')]
      .find(item => item.textContent.includes('Imprimir conversa'));
    expect(printItem).toBeDefined();
    printItem.click();
    expect(onPrint).toHaveBeenCalledTimes(1);
  });
});

describe('audio message notes', () => {
  it('renders a note below its audio bubble with clickable links', () => {
    const noteText = 'Aviso\n→ https://www.cnnbrasil.com.br/exemplo';
    const row = renderMessage({
      id: 2,
      sender: 'DV',
      type: 'audio',
      content: '[áudio]',
      note: noteText,
      time: '10:12:50',
    });

    describe('message source badge', () => {
      it('opens the source details and uses a message citation when available', () => {
        const onSourceClick = vi.fn();
        const row = renderMessage({
          id: 11,
          sender: 'DV',
          type: 'text',
          content: 'Mensagem',
          time: '10:00:00',
          source_cite: 'Relatório policial, página 12',
        }, 'DV', 'Daniel Vorcaro', { source: 'Fonte geral', onSourceClick });

        const source = row.querySelector('.chat-msg-source-badge');
        expect(source.title).toBe('Relatório policial, página 12');
        source.click();
        expect(onSourceClick).toHaveBeenCalledOnce();
      });
    });
    const bubbles = row.querySelectorAll('.chat-msg-bubble');
    const note = row.querySelector('.chat-msg-note-bubble');

    expect(bubbles).toHaveLength(2);
    expect(row.lastElementChild).toBe(note);
    expect(note.querySelector('.chat-msg-content').textContent).toBe(noteText);
    expect(note.querySelector('a')).toMatchObject({
      href: 'https://www.cnnbrasil.com.br/exemplo',
      target: '_blank',
    });
  });

  it('does not add a note bubble to other audio messages', () => {
    const row = renderMessage({
      id: 3,
      sender: 'DV',
      type: 'audio',
      content: '[áudio]',
      time: '10:12:51',
    });

    expect(row.querySelector('.chat-msg-note-bubble')).toBeNull();
  });
});
