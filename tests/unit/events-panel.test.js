import { describe, it, expect } from 'vitest';
import { renderEventsPanel } from '../../src/components/EventsPanel.js';
import { EVENTS } from '../../src/data/events.js';

describe('events agenda panel', () => {
  it('lists the provided events without implying confirmed attendance', () => {
    const panel = renderEventsPanel();

    expect(panel.querySelectorAll('.event-list-item')).toHaveLength(EVENTS.length);
    expect(panel.querySelector('.events-source-note').textContent).toContain('não comprova presença');
    expect(panel.textContent).toContain('Festa de aniversário + “Cine Trancoso”');
    expect(panel.querySelector('.event-list-item').dataset.eventId).toBe('trancoso-2022');
    expect(panel.querySelector('.event-list-item:last-child').dataset.eventId).toBe('institutional-meetings-2025');
  });

  it('shows documentation status and source links without overstating message references', () => {
    const panel = renderEventsPanel({ selectedId: 'moraes-message-2025-04-19' });
    const detail = panel.querySelector('.event-detail-pane');

    expect(detail.querySelector('.event-detail-status').textContent).toContain('não confirma que o encontro ocorreu');
    expect(detail.querySelectorAll('.event-sources-list a')).toHaveLength(2);
    expect(detail.querySelector('.event-sources-list a').rel).toContain('noopener');
  });

  it('keeps contemplated meetings marked as unconfirmed', () => {
    const panel = renderEventsPanel({ selectedId: 'bolsonaro-dinner-possible-2024' });

    expect(panel.querySelector('.event-detail-status').textContent).toContain('não há confirmação');
  });

  it('links the reported messages to their original conversation messages', () => {
    const panel = renderEventsPanel({ selectedId: 'moraes-message-andrei-2025-11-16' });

    expect(panel.querySelector('.event-detail-status').textContent).toContain('16h57min47s');
    expect(panel.querySelector('.event-sources-list a').getAttribute('href'))
      .toBe('#/chat/alexandre-de-moraes/msg/69');
  });

  it('orders the new calls and messages by their recorded time', () => {
    const panel = renderEventsPanel();
    const ids = [...panel.querySelectorAll('.event-list-item')].map(item => item.dataset.eventId);

    expect(ids.indexOf('flavio-call-2025-11-14')).toBeLessThan(ids.indexOf('moraes-followup-calls-2025-11-14'));
    expect(ids.indexOf('moraes-messages-2025-11-15')).toBeLessThan(ids.indexOf('flavio-call-2025-11-16'));
    expect(ids.indexOf('flavio-call-2025-11-16')).toBeLessThan(ids.indexOf('martha-call-2025-11-16'));
    expect(ids.indexOf('martha-call-2025-11-16')).toBeLessThan(ids.indexOf('moraes-message-andrei-2025-11-16'));
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
    expect(EVENTS.length).toBeGreaterThan(7);
  });
});
