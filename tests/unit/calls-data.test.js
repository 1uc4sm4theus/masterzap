// @vitest-environment node
//
// The call log the build writes. Two grammars go in — the Martha export's
// English, the police report's Portuguese — and one record comes out.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(import.meta.dirname, '../..');
const calls = JSON.parse(readFileSync(join(ROOT, 'public/data/calls.json'), 'utf-8')).calls;
const conversations = JSON.parse(readFileSync(join(ROOT, 'public/data/conversations.json'), 'utf-8')).conversations;

describe('calls.json', () => {
  it('holds every call from both sources', () => {
    expect(calls.length).toBeGreaterThan(1300);
    expect(new Set(calls.map(c => c.conversation_id)).size).toBeGreaterThan(5);
  });

  it('is newest first', () => {
    const stamps = calls.map(c => c.timestamp || `${c.date}T`);
    expect(stamps).toEqual([...stamps].sort().reverse());
  });

  it('names a conversation the site has, and a message in it', () => {
    const ids = new Set(conversations.map(c => c.id));
    for (const c of calls.filter(call => !call.reported)) {
      expect(ids.has(c.conversation_id), c.conversation_id).toBe(true);
      expect(c.message_id).toBeGreaterThan(0);
    }
  });

  it('includes separately labeled reported calls without inventing message records', () => {
    const reported = calls.filter(call => call.reported);
    expect(reported).toHaveLength(2);
    expect(reported).toEqual(expect.arrayContaining([
      expect.objectContaining({
        id: 'reported-moraes-followup-2025-11-14',
        name: 'Destinatários não identificados',
        display_time: 'após 17h17',
        conversation_id: null,
        message_id: null,
      }),
      expect.objectContaining({
        id: 'reported-martha-call-2025-11-16',
        name: 'Martha Graeff',
        display_time: 'aproximadamente 16h45',
        conversation_id: 'martha-graeff',
        message_id: null,
      }),
    ]));
  });

  it('reads the Portuguese of the report', () => {
    const c = calls.find(x => x.conversation_id === 'fabio-faria' && x.duration === '04:34');
    expect(c).toMatchObject({ kind: 'voice', status: 'completed', duration: '04:34', outgoing: false });
    const missed = calls.find(x => x.conversation_id === 'fabio-faria' && x.status === 'missed' && !x.outgoing);
    expect(missed).toMatchObject({ kind: 'voice', status: 'missed', outgoing: false });
  });

  it('includes Flávio Bolsonaro calls written in bracketed Portuguese', () => {
    const flavioCalls = calls.filter(c => c.conversation_id === 'flavio-bolsonaro');
    expect(flavioCalls).toHaveLength(6);
    expect(flavioCalls).toEqual(expect.arrayContaining([
      expect.objectContaining({ message_id: 9, kind: 'voice', status: 'completed', duration: '02:38', outgoing: false }),
      expect.objectContaining({ message_id: 14, kind: 'voice', status: 'completed', duration: '00:45', outgoing: false }),
      expect.objectContaining({ message_id: 15, kind: 'voice', status: 'completed', duration: '00:25', outgoing: false }),
      expect.objectContaining({ message_id: 19, kind: 'voice', status: 'completed', duration: '01:50', outgoing: false }),
      expect.objectContaining({
        message_id: 64,
        date: '2025-11-14',
        timestamp: '2025-11-14T12:36:00',
        kind: 'voice',
        status: 'missed',
        outgoing: false,
      }),
      expect.objectContaining({
        message_id: 67,
        date: '2025-11-16',
        timestamp: '2025-11-16T10:34:00',
        kind: 'voice',
        status: 'missed',
        outgoing: false,
      }),
    ]));
  });

  it('reads the English of the export', () => {
    const kinds = new Set(calls.filter(c => !c.reported).map(c => c.kind));
    expect(kinds).toEqual(new Set(['voice', 'video']));
    const statuses = new Set(calls.map(c => c.status));
    for (const s of ['completed', 'missed', 'no_answer', 'ended']) expect(statuses.has(s), s).toBe(true);
    expect(calls.filter(c => c.status === 'completed' && !c.duration)).toHaveLength(0);
  });

  it('knows who called', () => {
    expect(calls.some(c => c.outgoing)).toBe(true);
    expect(calls.some(c => !c.outgoing)).toBe(true);
  });
});
