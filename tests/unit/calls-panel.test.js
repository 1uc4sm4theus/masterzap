import { describe, it, expect } from 'vitest';
import { groupCalls, formatCallTime, renderCallsPanel } from '../../src/components/CallsPanel.js';

describe('grouping', () => {
  const call = (o) => ({ conversation_id: 'a', date: '2025-01-01', outgoing: true, status: 'completed', message_id: 1, timestamp: '2025-01-01T10:00:00', ...o });

  it('folds consecutive calls with the same person on the same day', () => {
    const rows = groupCalls([call({ message_id: 3 }), call({ message_id: 2 }), call({ message_id: 1, date: '2024-12-31' })]);
    expect(rows.map(r => [r.call.message_id, r.count])).toEqual([[3, 2], [1, 1]]);
  });

  it('keeps a missed call apart from an answered one', () => {
    const rows = groupCalls([call({ message_id: 2, status: 'missed', outgoing: false }), call({ message_id: 1 })]);
    expect(rows).toHaveLength(2);
  });

  it('keeps different people apart', () => {
    expect(groupCalls([call({ conversation_id: 'a' }), call({ conversation_id: 'b' })])).toHaveLength(2);
  });

  it('keeps reported call summaries separate from device call records', () => {
    const reported = {
      date: '2025-11-14',
      timestamp: '2025-11-14T17:17:00',
      conversation_id: null,
      message_id: null,
      name: 'Destinatários não identificados',
      kind: 'unknown',
      status: 'reported',
      outgoing: true,
      reported: true,
      description: 'Série de ligações após encontro',
      display_time: 'após 17h17',
      source_note: 'Relato publicado',
    };
    const rows = groupCalls([reported, { ...reported, id: 'call', reported: false, conversation_id: 'a', message_id: 2 }]);

    expect(rows).toHaveLength(2);
  });
});

describe('reported calls panel', () => {
  it('labels reported calls and does not present them as device call records', () => {
    const panel = renderCallsPanel({
      calls: [{
        date: '2025-11-16',
        timestamp: '2025-11-16T16:45:00',
        conversation_id: 'martha-graeff',
        message_id: null,
        name: 'Martha Graeff',
        kind: 'unknown',
        status: 'reported',
        outgoing: true,
        reported: true,
        description: 'Ligação após o encontro',
        display_time: 'aproximadamente 16h45',
        source_note: 'Horário aproximado; registro não disponível',
      }],
      conversations: [{ id: 'martha-graeff', contact: 'Martha Graeff' }],
    });

    expect(panel.querySelector('.calls-item').classList.contains('reported')).toBe(true);
    expect(panel.querySelector('.calls-item-meta').textContent).toContain('Relato publicado');
    expect(panel.querySelector('.calls-item-main').disabled).toBe(false);
    expect(panel.querySelector('.calls-item-kind-reported')).toBeTruthy();
  });
});

describe('formatCallTime', () => {
  it('reads like the phone: day, month, year, time', () => {
    expect(formatCallTime('2024-07-16T21:12:05')).toMatch(/^16 de jul\.? de 2024, 21:12$/);
  });
});
