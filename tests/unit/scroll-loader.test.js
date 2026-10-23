import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ScrollLoader } from '../../src/lib/scroll-loader.js';

// Mock IntersectionObserver for jsdom
class MockIntersectionObserver {
  static instances = [];

  constructor(callback) {
    this.callback = callback;
    this.elements = [];
    MockIntersectionObserver.instances.push(this);
  }
  observe(el) { this.elements.push(el); }
  unobserve(el) { this.elements = this.elements.filter(e => e !== el); }
  disconnect() { this.elements = []; }
  // Helper to simulate intersection
  trigger(isIntersecting) {
    return this.callback([{ isIntersecting }]);
  }
}

function createMockContainer() {
  const el = document.createElement('div');
  // Simulate scrollable container
  Object.defineProperty(el, 'scrollHeight', {
    get: () => el.children.length * 100,
    configurable: true,
  });
  Object.defineProperty(el, 'scrollTop', {
    value: 0,
    writable: true,
    configurable: true,
  });
  return el;
}

describe('ScrollLoader', () => {
  let container;
  let dateIndex;
  let loadMessages;
  let renderDay;

  beforeEach(() => {
    // Install mock IntersectionObserver
    MockIntersectionObserver.instances = [];
    globalThis.IntersectionObserver = MockIntersectionObserver;

    container = createMockContainer();
    document.body.appendChild(container);

    dateIndex = [
      { date: '2024-02-10', message_count: 5 },
      { date: '2024-02-11', message_count: 3 },
      { date: '2024-02-12', message_count: 7 },
      { date: '2024-02-13', message_count: 2 },
      { date: '2024-02-14', message_count: 4 },
    ];

    loadMessages = vi.fn((date) =>
      Promise.resolve([{ id: 1, date, content: `msg from ${date}` }])
    );

    renderDay = vi.fn((date, messages) => {
      const el = document.createElement('section');
      el.dataset.date = date;
      el.textContent = `Day: ${date}`;
      return el;
    });
  });

  it('loads initial batch of days on init', async () => {
    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();

    // Should load all 5 days (INITIAL_DAYS = 5, and we have exactly 5)
    expect(loader.loadedCount).toBe(5);
    expect(loadMessages).toHaveBeenCalledTimes(5);
  });

  it('loads most recent days first', async () => {
    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();

    // First call should be for the most recent date
    expect(loadMessages).toHaveBeenNthCalledWith(1, '2024-02-14');
    expect(loadMessages).toHaveBeenNthCalledWith(2, '2024-02-13');
  });

  it('creates a sentinel element', async () => {
    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();

    const sentinel = container.querySelector('.scroll-sentinel');
    expect(sentinel).not.toBeNull();
  });

  it('calls renderDay for each loaded day', async () => {
    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();

    expect(renderDay).toHaveBeenCalledTimes(5);
  });

  it('reports fully loaded when all days are loaded', async () => {
    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();

    expect(loader.isFullyLoaded).toBe(true);
  });

  it('handles empty date index gracefully', async () => {
    const loader = new ScrollLoader({
      container,
      dateIndex: [],
      loadMessages,
      renderDay,
    });
    await loader.init();

    expect(loader.loadedCount).toBe(0);
    expect(loader.isFullyLoaded).toBe(true);
  });

  it('loads only enough history to make the container scrollable', async () => {
    dateIndex = Array.from({ length: 20 }, (_, i) => ({
      date: `2024-02-${String(i + 1).padStart(2, '0')}`,
      message_count: 1,
    }));
    Object.defineProperty(container, 'clientHeight', {
      value: 450,
      configurable: true,
    });

    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();
    await MockIntersectionObserver.instances[0].trigger(true);

    expect(loader.loadedCount).toBe(10);
    expect(loader.isFullyLoaded).toBe(false);
    expect(loadMessages).toHaveBeenCalledTimes(10);
  });

  it('keeps dates in order when loading history after navigating to a search result', async () => {
    dateIndex = Array.from({ length: 20 }, (_, i) => ({
      date: `2024-02-${String(i + 1).padStart(2, '0')}`,
      message_count: 1,
    }));

    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();
    await loader.loadDate('2024-02-05');
    await MockIntersectionObserver.instances[0].trigger(true);

    expect(Array.from(container.querySelectorAll('[data-date]'), el => el.dataset.date))
      .toEqual([
        '2024-02-05',
        '2024-02-11',
        '2024-02-12',
        '2024-02-13',
        '2024-02-14',
        '2024-02-15',
        '2024-02-16',
        '2024-02-17',
        '2024-02-18',
        '2024-02-19',
        '2024-02-20',
      ]);
  });

  it('retries a failed date instead of skipping it', async () => {
    dateIndex = [
      { date: '2024-02-10', message_count: 1 },
      { date: '2024-02-11', message_count: 1 },
    ];
    const retryingLoader = vi.fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockImplementation((date) =>
        Promise.resolve([{ id: date, date, content: `msg from ${date}` }])
      );
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const loader = new ScrollLoader({ container, dateIndex, loadMessages: retryingLoader, renderDay });
    await loader.init();

    expect(consoleSpy).toHaveBeenCalled();
    expect(loader.loadedCount).toBe(0);
    expect(loader.isFullyLoaded).toBe(false);

    await MockIntersectionObserver.instances[0].trigger(true);

    expect(retryingLoader).toHaveBeenNthCalledWith(1, '2024-02-11');
    expect(retryingLoader).toHaveBeenNthCalledWith(2, '2024-02-11');
    expect(retryingLoader).toHaveBeenNthCalledWith(3, '2024-02-10');
    expect(loader.loadedCount).toBe(2);
    expect(loader.isFullyLoaded).toBe(true);
    expect(Array.from(container.querySelectorAll('[data-date]'), el => el.dataset.date))
      .toEqual(['2024-02-10', '2024-02-11']);
    consoleSpy.mockRestore();
  });

  it('cleans up observer on destroy', async () => {
    const loader = new ScrollLoader({ container, dateIndex, loadMessages, renderDay });
    await loader.init();
    loader.destroy();

    // Should not throw
    expect(() => loader.destroy()).not.toThrow();
  });
});
