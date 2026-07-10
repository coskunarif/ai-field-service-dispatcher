/**
 * Test suite for GainHelm software directory distribution.
 * Maps to SPEC.md acceptance criteria.
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse CSV simply but correctly
function parseCsv(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split(',');
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Match fields that might contain double quotes and commas
    const cols = [];
    let current = '';
    let insideQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());

    // Map array elements to header names
    const record = {};
    headers.forEach((header, index) => {
      // Remove surrounding quotes if present
      let val = cols[index] || '';
      if (val.startsWith('"') && val.endsWith('"')) {
        val = val.substring(1, val.length - 1);
      }
      record[header.trim()] = val;
    });
    records.push(record);
  }

  return records;
}

test.describe('GainHelm Directory Distribution validation', () => {
  const csvPath = path.resolve(__dirname, '../reports/gainhelm-gsc/submission-tracker.csv');
  const scriptPath = path.resolve(__dirname, '../scripts/directory_submitter.js');
  const evidenceDir = path.resolve(__dirname, '../reports/gainhelm-gsc/evidence');

  /**
   * [AC-1] Tracker Update
   * The CSV file reports/gainhelm-gsc/submission-tracker.csv must be updated to include
   * the following target directories with their initial/correct status and no duplicates.
   */
  test('[AC-1] Tracker Update - Target directories and URLs are correctly updated without duplicates', async () => {
    expect(fs.existsSync(csvPath)).toBe(true);
    const records = parseCsv(csvPath);

    const expectedTargets = [
      { target: 'SaaSHub', url: 'https://www.saashub.com/submit' },
      { target: 'BetaList', url: 'https://betalist.com/submit' },
      { target: 'Futurepedia', url: 'https://www.futurepedia.io/submit-a-tool' },
      { target: 'Toolify.ai', url: 'https://www.toolify.ai/submit' },
      { target: 'There’s An AI For That', url: 'https://theresanaiforthat.com/submit/' },
      { target: 'DevHunt', url: 'https://devhunt.org/' },
      { target: 'Startup Buffer', url: 'https://startupbuffer.com/site/submit' },
      { target: 'Indie Hackers', url: 'https://www.indiehackers.com/product/gainhelm' },
    ];

    for (const expected of expectedTargets) {
      // Look for the target case-insensitively
      const matches = records.filter(
        r => r.target && r.target.toLowerCase() === expected.target.toLowerCase()
      );

      // Assert exists
      expect(
        matches.length,
        `Expected directory "${expected.target}" to be registered in the CSV`
      ).toBeGreaterThan(0);
      // Assert no duplicates
      expect(matches.length, `Duplicate entries found for directory "${expected.target}"`).toBe(1);
      // Assert correct URL
      expect(matches[0].url, `Incorrect URL for directory "${expected.target}"`).toBe(expected.url);
    }
  });

  /**
   * [AC-2] Semi-Automated Playwright Script
   * A Node.js script scripts/directory_submitter.js must be implemented.
   * It must read gainhelm-listing-kit.md, import Playwright, support pauses (readline/input).
   */
  test('[AC-2] Semi-Automated Playwright Script - Script exists and contains required metadata, playwright imports, and readline prompts', async () => {
    expect(fs.existsSync(scriptPath), `Expected script to exist at ${scriptPath}`).toBe(true);

    const content = fs.readFileSync(scriptPath, 'utf-8');

    // Check that it references the listing kit
    expect(content, 'Script must reference the gainhelm-listing-kit.md').toContain(
      'gainhelm-listing-kit.md'
    );

    // Check that it imports Playwright
    expect(content, 'Script must import/require Playwright').toMatch(/playwright|chromium/i);

    // Check that it supports a readline or pause prompt mechanism
    expect(content, 'Script must implement a pause/readline mechanism for CAPTCHAs').toMatch(
      /readline|stdin|question|pause/i
    );

    // Check that the script handles the 7 target directories:
    const requiredDirectories = [
      'saashub',
      'betalist',
      'futurepedia',
      'toolify',
      'theresanaiforthat',
      'devhunt',
      'startupbuffer',
    ];
    for (const dir of requiredDirectories) {
      expect(
        content.toLowerCase(),
        `Script should implement submission step for target "${dir}"`
      ).toContain(dir);
    }
  });

  /**
   * [AC-3] Submission Evidence
   * The script must take screenshot evidence for each of the 7 target platforms
   * and save them under reports/gainhelm-gsc/evidence/ with descriptive names.
   */
  test('[AC-3] Submission Evidence - Verification of screenshot files under reports/gainhelm-gsc/evidence/', async () => {
    expect(
      fs.existsSync(evidenceDir),
      `Expected evidence directory to exist at ${evidenceDir}`
    ).toBe(true);

    const files = fs.readdirSync(evidenceDir);
    const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));

    // Must have at least 7 files
    expect(
      pngFiles.length,
      'Evidence directory must contain at least 7 screenshot files'
    ).toBeGreaterThanOrEqual(7);

    const platforms = [
      'saashub',
      'betalist',
      'futurepedia',
      'toolify',
      'theresanaiforthat',
      'devhunt',
      'startupbuffer',
    ];

    for (const platform of platforms) {
      const found = pngFiles.some(f => f.toLowerCase().includes(platform));
      expect(found, `No evidence screenshot found for platform "${platform}"`).toBe(true);
    }
  });

  /**
   * [AC-4] Status Verification
   * Target directory statuses in submission-tracker.csv must be updated to submitted, listed, or attempted-unclear.
   */
  test('[AC-4] Status Verification - Target directories are updated to final statuses', async () => {
    expect(fs.existsSync(csvPath)).toBe(true);
    const records = parseCsv(csvPath);

    const targetPlatforms = [
      'SaaSHub',
      'BetaList',
      'Futurepedia',
      'Toolify.ai',
      'There’s An AI For That',
      'DevHunt',
      'Startup Buffer',
    ];

    const allowedStatuses = ['submitted', 'listed', 'attempted-unclear'];

    for (const platform of targetPlatforms) {
      const record = records.find(
        r => r.target && r.target.toLowerCase() === platform.toLowerCase()
      );
      expect(record, `Expected directory "${platform}" to be in tracker`).toBeDefined();
      expect(
        allowedStatuses,
        `Directory "${platform}" status "${record.status}" is not one of: ${allowedStatuses.join(', ')}`
      ).toContain(record.status.toLowerCase());
    }
  });
});
