// @vitest-environment jsdom

import { describe, it, expect } from 'vitest';
import { renderMessage } from '../../src/components/ChatView.js';

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
