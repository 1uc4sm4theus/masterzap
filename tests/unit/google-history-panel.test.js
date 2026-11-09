import { beforeEach, describe, expect, it } from 'vitest';
import { GOOGLE_SEARCHES, renderGoogleHistoryPanel } from '../../src/components/GoogleHistoryPanel.js';

describe('renderGoogleHistoryPanel', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('shows the dated searches with journalistic attribution', () => {
    const panel = renderGoogleHistoryPanel();
    document.body.appendChild(panel);

    expect(GOOGLE_SEARCHES).toHaveLength(3);
    expect(panel.getAttribute('aria-label')).toBe('Histórico de pesquisas do Google');
    expect(panel.querySelectorAll('.google-history-entry')).toHaveLength(3);
    expect(panel.querySelector('.google-history-date').textContent).toBe('16 de novembro de 2025');
    expect(panel.textContent).toContain('O que é Tremembé?');
    expect(panel.textContent).toContain('Quem é Ricardo Soares Leite?');
    expect(panel.textContent).toContain('Pesquisas sobre a 10ª Vara Criminal de Brasília');
    expect(panel.textContent).toContain('não correspondem a uma exportação ou verificação do histórico da conta Google');
  });

  it('filters searches by query or attribution and reports no matches', () => {
    const panel = renderGoogleHistoryPanel();
    const input = panel.querySelector('.google-history-search input');
    const entries = panel.querySelectorAll('.google-history-entry');

    input.value = 'soares';
    input.dispatchEvent(new Event('input'));
    expect(entries[0].hidden).toBe(true);
    expect(entries[1].hidden).toBe(false);
    expect(entries[2].hidden).toBe(true);

    input.value = 'perícia';
    input.dispatchEvent(new Event('input'));
    expect(entries[0].hidden).toBe(false);

    input.value = 'nada encontrado';
    input.dispatchEvent(new Event('input'));
    expect(panel.querySelector('.google-history-empty').hidden).toBe(false);
  });

  it('provides a return action', () => {
    let returned = false;
    const panel = renderGoogleHistoryPanel({ onBack: () => { returned = true; } });
    panel.querySelector('.google-history-back').click();
    expect(returned).toBe(true);
  });
});
