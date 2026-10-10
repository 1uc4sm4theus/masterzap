import { describe, it, expect, beforeEach } from 'vitest';
import { CHATGPT_CONVERSATIONS, renderChatGPTPanel } from '../../src/components/ChatGPTPanel.js';

describe('renderChatGPTPanel', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('shows the cited conversations with editorial attribution and without invented answers', () => {
    const panel = renderChatGPTPanel();
    document.body.appendChild(panel);

    expect(CHATGPT_CONVERSATIONS).toHaveLength(21);
    expect(panel.getAttribute('aria-label')).toBe('Consultas ao ChatGPT citadas na reportagem');
    expect(panel.querySelector('.chatgpt-list-items').children).toHaveLength(21);
    expect(panel.querySelector('.chatgpt-list-item').textContent).toContain('Varas criminais federais');
    expect(panel.textContent).toContain('não representa o histórico completo de 151 interações');
    expect(panel.textContent).toContain('Resposta não reproduzida na reportagem.');
    panel.querySelectorAll('.chatgpt-list-item')[4].click();
    expect(panel.textContent).toContain('A formulação da pergunta foi resumida');
    panel.querySelectorAll('.chatgpt-list-item')[19].click();
    expect(panel.textContent).toContain('A reportagem informa que a resposta foi R$ 2,82.');
  });

  it('selects conversations and searches their titles and message text', () => {
    const panel = renderChatGPTPanel();
    document.body.appendChild(panel);

    const listItems = panel.querySelectorAll('.chatgpt-list-item');
    listItems[1].click();
    expect(panel.querySelector('.chatgpt-conversation-heading h2').textContent).toBe('Juízes das varas criminais de Brasília');
    expect(panel.querySelector('.chatgpt-thread').textContent).toContain('Quem são os juízes das varas criminais de Brasília');

    const search = panel.querySelector('.chatgpt-search');
    search.value = 'hapvida';
    search.dispatchEvent(new Event('input'));
    expect(listItems[0].hidden).toBe(true);
    expect(listItems[19].hidden).toBe(false);
  });

  it('provides a return action', () => {
    let returned = false;
    const panel = renderChatGPTPanel({ onBack: () => { returned = true; } });
    panel.querySelector('.chatgpt-back').click();
    expect(returned).toBe(true);
  });

  it('switches between the conversation list and reader on narrow screens', () => {
    const originalWidth = window.innerWidth;
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: 390 });
    const panel = renderChatGPTPanel();
    document.body.appendChild(panel);

    const list = panel.querySelector('.chatgpt-list');
    const reader = panel.querySelector('.chatgpt-reader');
    expect(reader.classList.contains('chatgpt-reader-visible')).toBe(false);

    panel.querySelector('.chatgpt-list-item').click();
    expect(list.classList.contains('chatgpt-list-hidden')).toBe(true);
    expect(reader.classList.contains('chatgpt-reader-visible')).toBe(true);

    panel.querySelector('.chatgpt-mobile-back').click();
    expect(list.classList.contains('chatgpt-list-hidden')).toBe(false);
    expect(reader.classList.contains('chatgpt-reader-visible')).toBe(false);
    Object.defineProperty(window, 'innerWidth', { configurable: true, value: originalWidth });
  });
});
