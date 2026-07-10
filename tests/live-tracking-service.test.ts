import { describe, it, expect, beforeEach } from 'vitest';
import {
  dispatchLogsStore,
  pendingNotes,
  getTrackingDetails,
  saveNote,
  pollNotes,
  renderTrackingPage,
} from '../live-tracking-service.js';

describe('pollNotes', () => {
  beforeEach(() => {
    pendingNotes.clear();
  });

  it('returns an empty array and deletes the key when no notes exist', () => {
    const notes = pollNotes('unknown-id');
    expect(notes).toEqual([]);
    expect(pendingNotes.has('unknown-id')).toBe(false);
  });

  it('returns queued notes and clears them after reading', () => {
    pendingNotes.set('job-1', ['gate code 1234', 'call on arrival']);
    const notes = pollNotes('job-1');
    expect(notes).toEqual(['gate code 1234', 'call on arrival']);
    expect(pendingNotes.has('job-1')).toBe(false);
  });
});

describe('getTrackingDetails', () => {
  beforeEach(() => {
    dispatchLogsStore.clear();
  });

  it('returns the in-memory dispatch when sql is not provided', async () => {
    const dispatch = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      status: 'dispatched',
      dispatched_to_name: 'Sarah Connor',
    };
    dispatchLogsStore.set(dispatch.id, dispatch);
    const result = await getTrackingDetails(dispatch.id, null);
    expect(result).toEqual(dispatch);
  });

  it('returns undefined for an unknown id without a database', async () => {
    const result = await getTrackingDetails('missing-id', null);
    expect(result).toBeUndefined();
  });
});

describe('saveNote', () => {
  beforeEach(() => {
    dispatchLogsStore.clear();
    pendingNotes.clear();
  });

  it('stores a note in pendingNotes and updates the in-memory log', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    dispatchLogsStore.set(id, {
      id,
      step_logs: JSON.stringify(['Initial dispatch']),
    });

    await saveNote(id, 'Leave package at side door', null);

    expect(pendingNotes.get(id)).toEqual(['Leave package at side door']);
    const updatedLog = dispatchLogsStore.get(id);
    const parsedLogs = JSON.parse(updatedLog.step_logs);
    expect(parsedLogs).toContain('📱 Customer sent entry note: Leave package at side door');
  });

  it('creates pendingNotes entry even when the log is not in memory', async () => {
    const id = 'missing-job-id';
    await saveNote(id, 'Beware of dog', null);
    expect(pendingNotes.get(id)).toEqual(['Beware of dog']);
  });
});

describe('renderTrackingPage', () => {
  it('renders a not-found page when dispatch is null', () => {
    const html = renderTrackingPage(null, null);
    expect(html).toContain('Tracking Link Not Found or Expired');
  });

  it('renders technician and ETA details for a valid dispatch', () => {
    const dispatch = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      dispatched_to_name: 'Dave Miller',
      duration_mins: 22,
      distance_miles: 7,
      traffic_multiplier: '1.8',
    };
    const context = { technicians: '[]' };
    const html = renderTrackingPage(dispatch, context);
    expect(html).toContain('Dave Miller');
    expect(html).toContain('ETA: <span id="eta-val">22</span> mins (7 miles)');
    expect(html).toContain('Rush Hour Traffic');
  });

  it('selects the matching technician from the context', () => {
    const dispatch = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      dispatched_to_name: 'Sarah Connor',
      duration_mins: 15,
      distance_miles: 5,
      traffic_multiplier: '1.0',
    };
    const context = {
      technicians: JSON.stringify([
        { name: 'Sarah Connor', lat: '41.88', lng: '-87.63' },
        { name: 'Dave Miller', lat: '41.90', lng: '-87.60' },
      ]),
    };
    const html = renderTrackingPage(dispatch, context);
    expect(html).toContain('Sarah Connor');
    expect(html).toContain('41.88');
    expect(html).toContain('-87.63');
  });

  it('labels normal traffic when multiplier is 1.0', () => {
    const dispatch = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      dispatched_to_name: 'Sarah Connor',
      duration_mins: 15,
      distance_miles: 5,
      traffic_multiplier: '1.0',
    };
    const html = renderTrackingPage(dispatch, { technicians: '[]' });
    expect(html).toContain('Normal Traffic');
  });

  it('labels accident traffic when multiplier is 3.0', () => {
    const dispatch = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      dispatched_to_name: 'Sarah Connor',
      duration_mins: 35,
      distance_miles: 8,
      traffic_multiplier: '3.0',
    };
    const html = renderTrackingPage(dispatch, { technicians: '[]' });
    expect(html).toContain('Accident Traffic');
  });
});
