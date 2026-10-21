import { describe, expect, it, vi } from 'vitest';
import { renderMediaPanel } from '../../src/components/MediaPanel.js';

describe('global media panel', () => {
  it('loads and lists document messages, opening the source message when selected', async () => {
    const onOpenMessage = vi.fn();
    const onLoadItems = vi.fn().mockResolvedValue([
      {
        type: 'document',
        attachment: 'relatorio.pdf',
        content: '[anexo] relatorio.pdf — Relatório mensal',
        conversation_id: 'angelo-silva',
        message_id: 42,
        conversation_name: 'Angelo Silva',
        sender: 'DV',
        owner: 'DV',
        date: '2025-04-03',
        timestamp: '2025-04-03T07:34:48',
      },
      { type: 'link', url: 'https://example.com', message_id: 43 },
    ]);
    const panel = renderMediaPanel({ onLoadItems, onOpenMessage });
    document.body.appendChild(panel);

    panel.querySelector('[data-tab="document"]').click();

    const row = await vi.waitFor(() => {
      const result = panel.querySelector('.media-record-row');
      expect(result).not.toBeNull();
      return result;
    });
    expect(onLoadItems).toHaveBeenCalledWith('document');
    expect(row.textContent).toContain('relatorio.pdf');
    expect(row.textContent).toContain('Relatório mensal');
    expect(row.textContent).toContain('Você');

    row.click();
    expect(onOpenMessage).toHaveBeenCalledWith('angelo-silva', 42);
    panel.remove();
  });

  it('loads and lists link messages in their own tab', async () => {
    const onLoadItems = vi.fn().mockResolvedValue([
      {
        type: 'link',
        url: 'https://example.com/artigo',
        linkTitle: 'Artigo de exemplo',
        linkHost: 'example.com',
        linkDescription: 'Resumo do artigo',
        conversation_id: 'angelo-silva',
        message_id: 43,
        conversation_name: 'Angelo Silva',
        sender: 'Angelo Silva',
        owner: 'DV',
        date: '2025-04-03',
        timestamp: '2025-04-03T07:35:55',
      },
      { type: 'document', attachment: 'outro.pdf' },
    ]);
    const panel = renderMediaPanel({ onLoadItems });
    document.body.appendChild(panel);

    panel.querySelector('[data-tab="link"]').click();

    const row = await vi.waitFor(() => {
      const result = panel.querySelector('.media-record-row');
      expect(result).not.toBeNull();
      return result;
    });
    expect(onLoadItems).toHaveBeenCalledWith('link');
    expect(row.textContent).toContain('Artigo de exemplo');
    expect(row.textContent).toContain('Resumo do artigo');
    expect(panel.querySelectorAll('.media-record-row')).toHaveLength(1);
    panel.remove();
  });
});
