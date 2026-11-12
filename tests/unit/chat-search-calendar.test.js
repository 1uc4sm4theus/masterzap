import { describe, it, expect, vi } from 'vitest';
import { buildCalendar } from '../../src/components/ChatSearchDrawer.js';
import { showMobileSearchBar } from '../../src/components/MobileSearchBar.js';

const dateIndex = [
  { date: '2025-01-15', message_count: 2 },
  { date: '2025-03-05', message_count: 1 },
];

describe('chat search calendar', () => {
  it('starts on the latest month and only enables dates with messages', () => {
    const calendar = buildCalendar(dateIndex);
    const marchDay = calendar.querySelector('[aria-label="5 de março de 2025"]');
    const emptyDay = calendar.querySelector('[aria-label="6 de março de 2025"]');

    expect(calendar.querySelector('.chat-calendar-label').textContent).toBe('março 2025');
    expect(marchDay.disabled).toBe(false);
    expect(emptyDay.disabled).toBe(true);
    expect(calendar.querySelector('.chat-calendar-nav-btn:last-child').disabled).toBe(true);
  });

  it('allows navigating within the conversation date range', () => {
    const calendar = buildCalendar(dateIndex);
    const prevButton = calendar.querySelector('.chat-calendar-nav-btn:first-child');

    prevButton.click();

    expect(calendar.querySelector('.chat-calendar-label').textContent).toBe('fevereiro 2025');
    expect(calendar.querySelector('.chat-calendar-nav-btn:first-child').disabled).toBe(false);
    expect(calendar.querySelector('.chat-calendar-nav-btn:last-child').disabled).toBe(false);
  });

  it('marks a selected date and calls the selection handler', () => {
    let selectedDate;
    const calendar = buildCalendar(dateIndex, (date) => { selectedDate = date; }, '2025-03-05');
    const selectedDay = calendar.querySelector('[aria-label="5 de março de 2025"]');

    expect(selectedDay.classList.contains('selected')).toBe(true);
    expect(selectedDay.getAttribute('aria-pressed')).toBe('true');

    selectedDay.click();

    expect(selectedDate).toBe('2025-03-05');
  });

  it('shows an empty state when no conversation dates are available', () => {
    const calendar = buildCalendar([]);

    expect(calendar.querySelector('.chat-calendar-empty').textContent).toBe('Nenhuma data disponível');
    expect(calendar.querySelector('.chat-calendar-nav')).toBeNull();
  });

  it('lets the reader jump to a partial month without inventing a day', () => {
    let selectedDate;
    const calendar = buildCalendar(
      [{ date: '2024-07', message_count: 1 }],
      date => { selectedDate = date; },
    );

    expect(calendar.querySelector('.chat-calendar-empty')).toBeNull();
    expect(calendar.querySelector('.chat-calendar-partial-select').value).toBe('2024-07');
    expect(calendar.querySelector('.chat-calendar-partial-select').selectedOptions[0].textContent)
      .toContain('dia não informado');
    calendar.querySelector('.chat-calendar-partial-go').click();
    expect(selectedDate).toBe('2024-07');
  });

  it('uses the calendar instead of a native date prompt on mobile', () => {
    vi.stubGlobal('requestAnimationFrame', (callback) => callback());
    vi.spyOn(window.history, 'back').mockImplementation(() => {});
    const prompt = vi.spyOn(window, 'prompt').mockImplementation(() => null);
    const chatView = document.createElement('div');
    chatView.innerHTML = '<header class="chat-header"></header>';
    document.body.appendChild(chatView);
    const onDateSelect = vi.fn();

    const searchBar = showMobileSearchBar(chatView, 'conversation', {
      dateIndex,
      onDateSelect,
    });
    chatView.querySelector('.mobile-search-nav-btn[aria-label="Pesquisar por data"]').click();
    chatView.querySelector('[aria-label="5 de março de 2025"]').click();

    expect(prompt).not.toHaveBeenCalled();
    expect(onDateSelect).toHaveBeenCalledWith('2025-03-05');
    expect(chatView.querySelector('.chat-calendar')).toBeNull();

    searchBar.destroy();
    chatView.remove();
    vi.restoreAllMocks();
  });
});
