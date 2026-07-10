import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  loadCredentials,
  buildGscQuery,
  analyze,
  generateMarkdownReport,
  fetchGscData,
  createAuthClient,
  main,
} from '../scripts/gsc-analyzer.mjs';

let tmpDir: string;
let originalFetch: typeof fetch;
const originalEnv = { ...process.env };

function setupTest() {
  tmpDir = mkdtempSync(join(tmpdir(), 'gsc-analyzer-test-'));
  originalFetch = globalThis.fetch;
}

function teardownTest() {
  globalThis.fetch = originalFetch;
  rmSync(tmpDir, { recursive: true, force: true });
  process.env = { ...originalEnv };
  vi.clearAllMocks();
}

describe('loadCredentials', () => {
  beforeEach(setupTest);
  afterEach(teardownTest);

  it('parses a raw JSON string', () => {
    const json = JSON.stringify({
      client_email: 'test@example.com',
      private_key: '-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----',
    });
    const creds = loadCredentials(json);
    expect(creds.client_email).toBe('test@example.com');
    expect(creds.token_uri).toBe('https://oauth2.googleapis.com/token');
  });

  it('reads credentials from a file path', () => {
    const filePath = join(tmpDir, 'creds.json');
    const json = JSON.stringify({
      client_email: 'from-file@example.com',
      private_key: 'key',
      token_uri: 'https://custom.example.com/token',
    });
    writeFileSync(filePath, json, 'utf8');
    const creds = loadCredentials(filePath);
    expect(creds.client_email).toBe('from-file@example.com');
    expect(creds.token_uri).toBe('https://custom.example.com/token');
  });

  it('throws on missing credentials when no default file exists', () => {
    expect(() => loadCredentials()).toThrow(/missing gsc credentials/i);
  });

  it('throws on invalid JSON', () => {
    expect(() => loadCredentials('not json')).toThrow(/invalid service account json/i);
  });

  it('throws on missing client_email or private_key', () => {
    expect(() => loadCredentials(JSON.stringify({ client_email: 'x' }))).toThrow(
      /client_email and private_key/i
    );
    expect(() => loadCredentials(JSON.stringify({ private_key: 'x' }))).toThrow(
      /client_email and private_key/i
    );
  });
});

describe('buildGscQuery', () => {
  it('returns a valid query with startDate before endDate', () => {
    const query = buildGscQuery('https://gainhelm.com/', 90);
    expect(query.dimensions).toEqual(['query', 'page']);
    expect(query.rowLimit).toBe(25000);
    expect(new Date(query.startDate).getTime()).toBeLessThan(new Date(query.endDate).getTime());
    const diffDays =
      (new Date(query.endDate).getTime() - new Date(query.startDate).getTime()) /
      (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(90);
  });

  it('clamps days to minimum and maximum bounds', () => {
    expect(buildGscQuery('https://gainhelm.com/', 1).endDate).toBe(
      buildGscQuery('https://gainhelm.com/', 7).endDate
    );
    expect(buildGscQuery('https://gainhelm.com/', 1000).endDate).toBe(
      buildGscQuery('https://gainhelm.com/', 487).endDate
    );
  });
});

describe('analyze', () => {
  it('returns empty result for no rows', () => {
    const result = analyze([]);
    expect(result.totals.clicks).toBe(0);
    expect(result.totals.impressions).toBe(0);
    expect(result.topQueries).toEqual([]);
    expect(result.topPages).toEqual([]);
  });

  it('aggregates queries and pages across multiple rows', () => {
    const rows = [
      {
        keys: ['hvac dispatch software', '/hvac-dispatch-software'],
        clicks: 10,
        impressions: 100,
        ctr: 0.1,
        position: 5.5,
      },
      {
        keys: ['hvac dispatch software', '/hvac-dispatch-software'],
        clicks: 5,
        impressions: 50,
        ctr: 0.1,
        position: 6.0,
      },
    ];
    const result = analyze(rows);
    expect(result.totals.clicks).toBe(15);
    expect(result.totals.impressions).toBe(150);
    expect(result.topQueries[0]).toMatchObject({
      query: 'hvac dispatch software',
      clicks: 15,
      impressions: 150,
    });
    expect(result.topPages[0]).toMatchObject({
      page: '/hvac-dispatch-software',
      clicks: 15,
      impressions: 150,
    });
  });

  it('identifies low-CTR opportunities', () => {
    const rows = [
      {
        keys: ['high imp low ctr', '/page'],
        clicks: 1,
        impressions: 1000,
        ctr: 0.001,
        position: 8,
      },
    ];
    const result = analyze(rows);
    expect(result.lowCtrOpportunities.length).toBe(1);
    expect(result.lowCtrOpportunities[0].query).toBe('high imp low ctr');
  });

  it('identifies position improvement candidates', () => {
    const rows = [
      {
        keys: ['position 8', '/page'],
        clicks: 5,
        impressions: 100,
        ctr: 0.05,
        position: 8,
      },
    ];
    const result = analyze(rows);
    expect(result.positionImprovements.length).toBe(1);
    expect(result.positionImprovements[0].query).toBe('position 8');
  });
});

describe('generateMarkdownReport', () => {
  it('includes summary and top queries for populated data', () => {
    const result = analyze([
      {
        keys: ['q1', '/p1'],
        clicks: 10,
        impressions: 100,
        ctr: 0.1,
        position: 5,
      },
    ]);
    const md = generateMarkdownReport(result);
    expect(md).toContain('Google Search Console Analysis Report');
    expect(md).toContain('q1');
    expect(md).toContain('/p1');
    expect(md).toContain('Recommended Actions');
  });

  it('handles empty data with starter recommendations', () => {
    const result = analyze([]);
    const md = generateMarkdownReport(result);
    expect(md).toContain('No search performance data');
    expect(md).toContain('Starter Recommendations');
  });
});

describe('fetchGscData', () => {
  it('calls the GSC API with the provided bearer token', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ rows: [] }),
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    const result = await fetchGscData(
      'https://gainhelm.com/',
      {
        startDate: '2026-01-01',
        endDate: '2026-01-02',
        dimensions: ['query', 'page'],
        rowLimit: 1,
      },
      async () => 'mock-token'
    );

    expect(fetchMock).toHaveBeenCalledWith(
      'https://www.googleapis.com/webmasters/v3/sites/https%3A%2F%2Fgainhelm.com%2F/searchAnalytics/query',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer mock-token',
          'Content-Type': 'application/json',
        }),
      })
    );
    expect(result.rows).toEqual([]);
  });

  it('throws on GSC API error with status and body', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      text: vi.fn().mockResolvedValue('Forbidden'),
    } as unknown as Response);
    globalThis.fetch = fetchMock;

    await expect(fetchGscData('https://gainhelm.com/', {}, async () => 'token')).rejects.toThrow(
      /gsc api error 403/i
    );
  });
});

describe('createAuthClient', () => {
  it('is exported and returns a function', () => {
    const creds = {
      client_email: 'test@example.com',
      private_key: 'key',
      token_uri: 'https://token',
    };
    const getToken = createAuthClient(creds);
    expect(typeof getToken).toBe('function');
  });
});

describe('main', () => {
  beforeEach(setupTest);
  afterEach(teardownTest);

  it('writes JSON and Markdown reports when configured', async () => {
    process.env.GSC_SITE_URL = 'https://gainhelm.com/';
    process.env.GSC_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: 'test@example.com',
      private_key: 'key',
    });
    process.env.GSC_OUT_DIR = tmpDir;

    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ rows: [] }),
    } as unknown as Response);

    await main({ getAccessToken: async () => 'mock-token' });

    const json = JSON.parse(readFileSync(join(tmpDir, 'gsc-analysis.json'), 'utf8'));
    const md = readFileSync(join(tmpDir, 'gsc-analysis.md'), 'utf8');
    expect(json.totals.clicks).toBe(0);
    expect(md).toContain('Google Search Console Analysis Report');
  });

  it('throws when GSC_SITE_URL is missing', async () => {
    process.env.GSC_SERVICE_ACCOUNT_JSON = JSON.stringify({
      client_email: 'test@example.com',
      private_key: 'key',
    });
    await expect(main({ getAccessToken: async () => 'token' })).rejects.toThrow(
      /missing gsc_site_url/i
    );
  });
});
