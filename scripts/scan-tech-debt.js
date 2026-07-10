#!/usr/bin/env node
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const markers = [
  { name: 'TODO', pattern: /\bTODO\b/g },
  { name: 'FIXME', pattern: /\bFIXME\b/g },
  { name: 'HACK', pattern: /\bHACK\b/g },
  { name: 'XXX', pattern: /\bXXX\b/g },
];

const issueRefPattern = /\([^)]*(?:#|ISSUE-)[0-9]+\)/;

const skippedDirs = new Set([
  'node_modules',
  '.git',
  'artifacts',
  'playwright-report',
  'test-results',
  '.husky',
  '.agents',
  'dist',
  'build',
  'coverage',
]);

const root = process.cwd();

function scanDirectory(dir) {
  let total = 0;
  for (const entry of readdirSync(dir)) {
    if (skippedDirs.has(entry)) continue;

    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      total += scanDirectory(fullPath);
    } else if (stats.isFile() && /\.(js|mjs|ts)$/.test(entry)) {
      total += scanFile(fullPath);
    }
  }
  return total;
}

function scanFile(path) {
  let count = 0;
  const content = readFileSync(path, 'utf8');
  const lines = content.split('\n');
  const relativePath = relative(root, path);

  for (const { name, pattern } of markers) {
    for (const match of content.matchAll(pattern)) {
      const lineNumber = content.slice(0, match.index).split('\n').length;
      const lineText = lines[lineNumber - 1] ?? '';
      const hasIssueRef = issueRefPattern.test(lineText);
      count += 1;
      console.log(
        `${relativePath}:${lineNumber} ${name}${hasIssueRef ? '' : ' (no issue reference)'}`
      );
    }
  }
  return count;
}

const found = scanDirectory(root);
console.log(`\nTech-debt scan complete: ${found} marker(s) found.`);
process.exit(0);
