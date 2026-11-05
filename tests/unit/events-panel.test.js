import { describe, it, expect } from 'vitest';
import { renderEventsPanel } from '../../src/components/EventsPanel.js';
import { EVENTS } from '../../src/data/events.js';

describe('events agenda panel', () => {
  it('lists the provided events without implying confirmed attendance', () => {
    const panel = renderEventsPanel();

    expect(panel.querySelectorAll('.event-list-item')).toHaveLength(7);
    expect(panel.querySelector('.events-source-note').textContent).toContain('não comprova presença');
    expect(panel.textContent).toContain('Festa de aniversário + “Cine Trancoso”');
  });

  it('shows the selected event date, approximate time, location and names', () => {
    const panel = renderEventsPanel();
    panel.querySelector('[data-event-id="forum-londres-2024"]').click();

    const detail = panel.querySelector('.event-detail-pane');
    expect(detail.textContent).toContain('24–26 de abril de 2024');
    expect(detail.textContent).toContain('Horário aproximado');
    expect(detail.textContent).toContain('Hotel Peninsula');
    expect(detail.textContent).toContain('Michel Temer');
    expect(panel.querySelector('[data-event-id="forum-londres-2024"]').getAttribute('aria-selected')).toBe('true');
  });

  it('supports returning to the list on narrow-screen layouts', () => {
    const panel = renderEventsPanel();
    panel.querySelector('[data-event-id="vorcaroween-2023"]').click();
    expect(panel.classList.contains('event-selected')).toBe(true);

    panel.querySelector('.event-detail-back').click();

    expect(panel.classList.contains('event-selected')).toBe(false);
  });

  it('can render a custom empty event list', () => {
    const panel = renderEventsPanel({ events: [] });

    expect(panel.querySelectorAll('.event-list-item')).toHaveLength(0);
    expect(panel.querySelector('.event-detail-empty').textContent).toContain('Selecione um evento');
    expect(EVENTS).toHaveLength(7);
  });
});
