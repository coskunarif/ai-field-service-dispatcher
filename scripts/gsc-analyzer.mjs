#!/usr/bin/env node
import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleAuth } from 'google-auth-library';

const DEFAULT_DAYS = 90;
const MIN_DAYS = 7;
const MAX_DAYS = 487;
const DEFAULT_OUT_DIR = 'reports';
const DEFAULT_CREDENTIALS_FILE = 'gsc-service-account.json';
const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3/sites';

/**
 * Load Google service account credentials from a raw JSON string or file path.
 * Falls back to `gsc-service-account.json` in the project root if no input is provided.
 *
 * @param {string} [input] - Raw JSON string or path to a service account JSON file.
 * @returns {{ client_email: string, private_key: string, token_uri: string }}
 */
export function loadCredentials(input) {
  let source = input;

  if (!source) {
    if (existsSync(DEFAULT_CREDENTIALS_FILE)) {
      source = readFileSync(DEFAULT_CREDENTIALS_FILE, 'utf8');
    } else {
      throw new Error(
        `Missing GSC credentials. Set GSC_SERVICE_ACCOUNT_JSON env var to a JSON file path or raw JSON, or create ${DEFAULT_CREDENTIALS_FILE}.`
      );
    }
  }

  let creds;
  try {
    creds = JSON.parse(source);
  } catch (parseErr) {
    try {
      source = readFileSync(source, 'utf8');
      creds = JSON.parse(source);
    } catch {
      throw new Error(`Invalid service account JSON: ${parseErr.message}`);
    }
  }

  if (!creds.client_email || !creds.private_key) {
    throw new Error('Service account JSON must contain client_email and private_key.');
  }

  return {
    client_email: creds.client_email,
    private_key: creds.private_key,
    token_uri: creds.token_uri || 'https://oauth2.googleapis.com/token',
  };
}

/**
 * Build a Google Search Console searchAnalytics/query request body.
 *
 * @param {string} siteUrl - GSC property URL (used only for validation context here).
 * @param {number} days - Number of days to look back.
 * @returns {{ startDate: string, endDate: string, dimensions: string[], rowLimit: number }}
 */
export function buildGscQuery(siteUrl, days) {
  if (!siteUrl) {
    throw new Error('siteUrl is required');
  }

  const clampedDays = Math.min(
    Math.max(Number.isFinite(days) ? days : DEFAULT_DAYS, MIN_DAYS),
    MAX_DAYS
  );
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - clampedDays);

  const fmt = d => d.toISOString().split('T')[0];

  return {
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    dimensions: ['query', 'page'],
    rowLimit: 25000,
  };
}

/**
 * Analyze GSC search analytics rows and extract actionable insights.
 *
 * @param {Array<{ keys: string[], clicks: number, impressions: number, ctr: number, position: number }>} rows
 * @returns {object} Structured analysis result.
 */
export function analyze(rows) {
  const safeRows = Array.isArray(rows) ? rows : [];

  if (safeRows.length === 0) {
    return {
      totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
      topQueries: [],
      topPages: [],
      lowCtrOpportunities: [],
      positionImprovements: [],
      movers: { rising: [], falling: [] },
      generatedAt: new Date().toISOString(),
    };
  }

  let totalClicks = 0;
  let totalImpressions = 0;
  let weightedPositionSum = 0;

  const queryMap = new Map();
  const pageMap = new Map();

  for (const row of safeRows) {
    const [query, page] = row.keys || [];
    const clicks = row.clicks || 0;
    const impressions = row.impressions || 0;
    const position = row.position || 0;

    totalClicks += clicks;
    totalImpressions += impressions;
    weightedPositionSum += position * impressions;

    if (!queryMap.has(query)) {
      queryMap.set(query, {
        query,
        clicks: 0,
        impressions: 0,
        positionSum: 0,
        positionCount: 0,
      });
    }
    const q = queryMap.get(query);
    q.clicks += clicks;
    q.impressions += impressions;
    q.positionSum += position * impressions;
    q.positionCount += impressions;

    if (!pageMap.has(page)) {
      pageMap.set(page, {
        page,
        clicks: 0,
        impressions: 0,
        positionSum: 0,
        positionCount: 0,
      });
    }
    const p = pageMap.get(page);
    p.clicks += clicks;
    p.impressions += impressions;
    p.positionSum += position * impressions;
    p.positionCount += impressions;
  }

  const finalize = items =>
    items.map(item => ({
      ...item,
      ctr: item.impressions ? item.clicks / item.impressions : 0,
      position: item.positionCount ? item.positionSum / item.positionCount : 0,
    }));

  const queries = finalize(Array.from(queryMap.values()));
  const pages = finalize(Array.from(pageMap.values()));

  const topQueries = queries
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, 20);

  const topPages = pages
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, 20);

  const lowCtrOpportunities = queries
    .filter(q => q.impressions >= 100 && q.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 15);

  const positionImprovements = queries
    .filter(q => q.position >= 4 && q.position <= 20 && q.impressions >= 50)
    .sort((a, b) => a.position - b.position || b.impressions - a.impressions)
    .slice(0, 15);

  return {
    totals: {
      clicks: totalClicks,
      impressions: totalImpressions,
      ctr: totalImpressions ? totalClicks / totalImpressions : 0,
      position: totalImpressions ? weightedPositionSum / totalImpressions : 0,
    },
    topQueries,
    topPages,
    lowCtrOpportunities,
    positionImprovements,
    movers: { rising: [], falling: [] },
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a Markdown summary of the GSC analysis result.
 *
 * @param {object} result - Output from `analyze()`.
 * @returns {string} Markdown report.
 */
export function generateMarkdownReport(result) {
  const { totals, topQueries, topPages, lowCtrOpportunities, positionImprovements, generatedAt } =
    result;

  let md = `# Google Search Console Analysis Report\n\n`;
  md += `Generated: ${generatedAt}\n\n`;

  md += `## Summary\n\n`;
  md += `- Clicks: ${totals.clicks.toLocaleString()}\n`;
  md += `- Impressions: ${totals.impressions.toLocaleString()}\n`;
  md += `- Average CTR: ${(totals.ctr * 100).toFixed(2)}%\n`;
  md += `- Average Position: ${totals.position.toFixed(2)}\n\n`;

  if (topQueries.length === 0) {
    md += `## No Data\n\n`;
    md += `No search performance data was available for the selected period.\n\n`;
    md += `## Starter Recommendations\n\n`;
    md += `- Verify the site is verified in Google Search Console.\n`;
    md += `- Ensure the sitemap is submitted and robots.txt allows crawling.\n`;
    md += `- Run the existing SEO/GEO audit: \`npm run audit:seo-geo\`.\n`;
    return md;
  }

  md += `## Top Queries\n\n`;
  md += `| Query | Clicks | Impressions | CTR | Position |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  for (const q of topQueries) {
    md += `| ${q.query} | ${q.clicks} | ${q.impressions} | ${(q.ctr * 100).toFixed(2)}% | ${q.position.toFixed(2)} |\n`;
  }
  md += `\n`;

  md += `## Top Pages\n\n`;
  md += `| Page | Clicks | Impressions | CTR | Position |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  for (const p of topPages) {
    md += `| ${p.page} | ${p.clicks} | ${p.impressions} | ${(p.ctr * 100).toFixed(2)}% | ${p.position.toFixed(2)} |\n`;
  }
  md += `\n`;

  md += `## Low-CTR Opportunities\n\n`;
  md += `High impressions but low CTR. Consider improving title tags and meta descriptions for these queries.\n\n`;
  md += `| Query | Impressions | Clicks | CTR | Position |\n`;
  md += `| --- | --- | --- | --- | --- |\n`;
  for (const q of lowCtrOpportunities) {
    md += `| ${q.query} | ${q.impressions} | ${q.clicks} | ${(q.ctr * 100).toFixed(2)}% | ${q.position.toFixed(2)} |\n`;
  }
  md += `\n`;

  md += `## Position Improvement Candidates\n\n`;
  md += `These queries rank in positions 4-20. Small content or backlink improvements may push them onto page one.\n\n`;
  md += `| Query | Position | Impressions | Clicks |\n`;
  md += `| --- | --- | --- | --- |\n`;
  for (const q of positionImprovements) {
    md += `| ${q.query} | ${q.position.toFixed(2)} | ${q.impressions} | ${q.clicks} |\n`;
  }
  md += `\n`;

  md += `## Recommended Actions\n\n`;
  md += `1. Refresh meta descriptions and title tags for low-CTR queries using the existing \`optimize-seo-geo-pages.mjs\` workflow.\n`;
  md += `2. Expand content around position-improvement candidates (add FAQ schema, trade-specific keywords).\n`;
  md += `3. Re-run this analyzer monthly to track progress.\n`;
  md += `4. Continue running \`npm run audit:seo-geo\` before each deploy.\n`;

  return md;
}

/**
 * Fetch search analytics data from the Google Search Console API.
 *
 * @param {string} siteUrl - GSC property URL.
 * @param {object} query - GSC searchAnalytics/query body.
 * @param {() => Promise<string>} getAccessToken - Function that resolves to a bearer token.
 * @returns {Promise<object>} API response body.
 */
export async function fetchGscData(siteUrl, query, getAccessToken) {
  const token = await getAccessToken();
  const encodedSiteUrl = encodeURIComponent(siteUrl);
  const url = `${GSC_API_BASE}/${encodedSiteUrl}/searchAnalytics/query`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(query),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GSC API error ${res.status}: ${body}`);
  }

  return res.json();
}

/**
 * Create a function that returns a fresh Google access token from a service account.
 *
 * @param {{ client_email: string, private_key: string, token_uri?: string }} credentials
 * @returns {() => Promise<string>}
 */
export function createAuthClient(credentials) {
  const auth = new GoogleAuth({
    credentials: {
      client_email: credentials.client_email,
      private_key: credentials.private_key,
    },
    scopes: [GSC_SCOPE],
  });

  return async () => {
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    return typeof tokenResponse === 'string' ? tokenResponse : tokenResponse?.token;
  };
}

/**
 * CLI entry point. Orchestrates credentials, API fetch, analysis, and report writing.
 *
 * @param {{ getAccessToken?: () => Promise<string> }} [deps] - Optional dependencies for testing.
 * @returns {Promise<void>}
 */
export async function main(deps = {}) {
  const siteUrl = process.env.GSC_SITE_URL;
  if (!siteUrl) {
    throw new Error(
      'Missing GSC_SITE_URL env var. Example: sc-domain:gainhelm.com or https://gainhelm.com/'
    );
  }

  const daysRaw = process.env.GSC_DAYS || String(DEFAULT_DAYS);
  let days = parseInt(daysRaw, 10);
  if (Number.isNaN(days)) days = DEFAULT_DAYS;
  days = Math.min(Math.max(days, MIN_DAYS), MAX_DAYS);

  const outDir = process.env.GSC_OUT_DIR || DEFAULT_OUT_DIR;
  const credentials = loadCredentials(process.env.GSC_SERVICE_ACCOUNT_JSON);

  const query = buildGscQuery(siteUrl, days);
  const getAccessToken = deps.getAccessToken || createAuthClient(credentials);
  const data = await fetchGscData(siteUrl, query, getAccessToken);
  const result = analyze(data.rows);

  const jsonPath = join(outDir, 'gsc-analysis.json');
  const mdPath = join(outDir, 'gsc-analysis.md');

  mkdirSync(outDir, { recursive: true });
  writeFileSync(jsonPath, JSON.stringify(result, null, 2), 'utf8');
  writeFileSync(mdPath, generateMarkdownReport(result), 'utf8');

  console.log(`Wrote ${jsonPath}`);
  console.log(`Wrote ${mdPath}`);
}

const __filename = fileURLToPath(import.meta.url);
if (resolve(__filename) === resolve(process.argv[1])) {
  main().catch(err => {
    console.error(err.message);
    process.exit(1);
  });
}
