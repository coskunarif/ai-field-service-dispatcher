import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  formatE164Phone,
  sendTwilioSms,
  forwardLeadWebhook,
  notifyEmergencyDispatch,
} from '../lib/dispatch-notifier.js';

describe('formatE164Phone', () => {
  it('formats standard 10-digit US phone numbers', () => {
    expect(formatE164Phone('5551234567')).toBe('+15551234567');
    expect(formatE164Phone('(555) 123-4567')).toBe('+15551234567');
    expect(formatE164Phone('555-123-4567')).toBe('+15551234567');
  });

  it('formats 11-digit numbers starting with 1', () => {
    expect(formatE164Phone('15551234567')).toBe('+15551234567');
    expect(formatE164Phone('+1-555-123-4567')).toBe('+15551234567');
  });

  it('returns null for invalid inputs', () => {
    expect(formatE164Phone(null as unknown as string)).toBeNull();
    expect(formatE164Phone('')).toBeNull();
    expect(formatE164Phone('12345')).toBeNull();
  });
});

describe('sendTwilioSms', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('gracefully skips sending when Twilio credentials are missing', async () => {
    const res = await sendTwilioSms({
      to: '5551234567',
      body: 'Test SMS',
      env: {},
    });

    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
    expect(res.reason).toContain('Twilio credentials not configured');
  });

  it('sends SMS via Twilio REST API when credentials are present', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sid: 'SM12345' }),
    });
    globalThis.fetch = mockFetch;

    const env = {
      TWILIO_ACCOUNT_SID: 'ACtest',
      TWILIO_AUTH_TOKEN: 'token123',
      TWILIO_PHONE_NUMBER: '+18005550199',
    };

    const res = await sendTwilioSms({
      to: '5551234567',
      body: 'Your technician is en route',
      env,
    });

    expect(res.ok).toBe(true);
    expect(res.sid).toBe('SM12345');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [url, options] = mockFetch.mock.calls[0];
    expect(url).toContain('ACtest/Messages.json');
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Basic QUN0ZXN0OnRva2VuMTIz');
  });

  it('handles Twilio API error responses', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: 'Invalid recipient' }),
    });
    globalThis.fetch = mockFetch;

    const env = {
      TWILIO_ACCOUNT_SID: 'ACtest',
      TWILIO_AUTH_TOKEN: 'token123',
      TWILIO_PHONE_NUMBER: '+18005550199',
    };

    const res = await sendTwilioSms({
      to: '5551234567',
      body: 'Test failure',
      env,
    });

    expect(res.ok).toBe(false);
    expect(res.error).toBe('Invalid recipient');
  });
});

describe('forwardLeadWebhook', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('skips webhook when LEAD_WEBHOOK_URL is not configured', async () => {
    const res = await forwardLeadWebhook({
      payload: { id: 'test' },
      env: {},
    });

    expect(res.ok).toBe(false);
    expect(res.skipped).toBe(true);
  });

  it('posts payload to webhook when configured', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
    });
    globalThis.fetch = mockFetch;

    const env = { LEAD_WEBHOOK_URL: 'https://hooks.zapier.com/hooks/catch/123' };
    const res = await forwardLeadWebhook({
      payload: { id: 'lead-1', trade: 'plumbing' },
      env,
    });

    expect(res.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe('https://hooks.zapier.com/hooks/catch/123');
  });
});

describe('notifyEmergencyDispatch', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('executes customer SMS, contractor alert, and webhook dispatch in unison', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ sid: 'SMtest' }),
    });
    globalThis.fetch = mockFetch;

    const env = {
      TWILIO_ACCOUNT_SID: 'ACtest',
      TWILIO_AUTH_TOKEN: 'token123',
      TWILIO_PHONE_NUMBER: '+18005550199',
      CONTRACTOR_ALERT_PHONE: '+15559998877',
      LEAD_WEBHOOK_URL: 'https://webhook.site/dispatch',
    };

    const dispatch = {
      id: 'uuid-123',
      trade: 'hvac',
      issue: 'ac-blown-fuse',
      urgency: 'emergency',
      zipCode: '75001',
      phone: '555-444-3322',
      address: '100 Main St',
      assignedTech: 'Marcus Cole',
      trackingUrl: '/app/track/uuid-123',
      etaMins: 22,
    };

    const results = await notifyEmergencyDispatch({ dispatch, env });

    expect(results.customerSms.ok).toBe(true);
    expect(results.contractorAlert.ok).toBe(true);
    expect(results.webhook.ok).toBe(true);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
